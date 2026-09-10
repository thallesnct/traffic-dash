import { describe, it, expect } from "vitest";

import { resolveWindow, resolvePreviousWindow, toIsoDate } from "./window";

describe("toIsoDate", () => {
  it("resolves the correct date", () => {
    const date = new Date(2026, 8, 10);
    const isoDate = toIsoDate(date);

    expect(isoDate).toBe("2026-09-10");
  });
});

describe("resolveWindow", () => {
  const today = new Date();
  const isoDateToday = toIsoDate(today);

  it("resolves 7d to a 7-day inclusive range ending today", () => {
    const { startDate, endDate, days } = resolveWindow("7d", today);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

    expect(endDate).toBe(isoDateToday);
    expect(startDate).toBe(toIsoDate(sevenDaysAgo));
    expect(days).toBe(7);
  });

  it("resolves 30d to a 30-day inclusive range ending today", () => {
    const { startDate, endDate } = resolveWindow("30d", today);
    const aMonthAgo = new Date(today);
    aMonthAgo.setUTCDate(today.getUTCDate() - 29);

    expect(endDate).toBe(isoDateToday);
    expect(startDate).toBe(toIsoDate(aMonthAgo));
  });

  it("resolves 90d to a 90-day inclusive range ending today", () => {
    const { startDate, endDate } = resolveWindow("90d", today);
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setUTCDate(today.getUTCDate() - 89);

    expect(endDate).toBe(isoDateToday);
    expect(startDate).toBe(toIsoDate(threeMonthsAgo));
  });

  it("is anchored on the UTC calendar date regardless of time-of-day", () => {
    const lateNight = new Date(`${isoDateToday}T23:59:00.000Z`);
    const earlyMorning = new Date(`${isoDateToday}T00:01:00.000Z`);

    expect(resolveWindow("7d", lateNight).endDate).toBe(
      resolveWindow("7d", earlyMorning).endDate,
    );
  });
});

describe("resolvePreviousWindow", () => {
  const today = new Date();

  it("is the immediately preceding window of equal length, with no gap or overlap", () => {
    const current = resolveWindow("7d", today);
    const previous = resolvePreviousWindow("7d", today);

    const prevEndDate = new Date(today);
    prevEndDate.setUTCDate(prevEndDate.getUTCDate() - 7);

    const prevStartDate = new Date(today);
    prevStartDate.setUTCDate(prevStartDate.getUTCDate() - 13);

    expect(previous.endDate).toBe(toIsoDate(prevEndDate));
    expect(previous.startDate).toBe(toIsoDate(prevStartDate));
    expect(previous.days).toBe(current.days);

    const currentStartDate = new Date(prevEndDate);
    currentStartDate.setUTCDate(currentStartDate.getUTCDate() + 1);

    expect(toIsoDate(currentStartDate)).toBe(current.startDate);
  });

  it("handles a 90d previous window across a month boundary", () => {
    const current = resolveWindow("90d", today);
    const previous = resolvePreviousWindow("90d", today);

    const prevEndDate = new Date(today);
    prevEndDate.setUTCDate(prevEndDate.getUTCDate() - 90);

    const prevStartDate = new Date(today);
    prevStartDate.setUTCDate(prevStartDate.getUTCDate() - 179);

    expect(previous.endDate).toBe(toIsoDate(prevEndDate));
    expect(previous.startDate).toBe(toIsoDate(prevStartDate));

    const currentStartDate = new Date(prevEndDate);
    currentStartDate.setUTCDate(currentStartDate.getUTCDate() + 1);

    expect(toIsoDate(currentStartDate)).toBe(current.startDate);
  });
});
