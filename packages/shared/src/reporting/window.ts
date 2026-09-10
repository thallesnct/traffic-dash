import { z } from "zod";

export const WINDOWS = ["7d", "30d", "90d"] as const;
export const windowSchema = z.enum(WINDOWS);
export type Window = z.infer<typeof windowSchema>;

export const WINDOW_DAYS: Record<Window, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export type IsoDate = string;

export function toIsoDate(date: Date): IsoDate {
  return date.toISOString().substring(0, 10);
}

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return !Number.isNaN(date.getTime()) && toIsoDate(date) === value;
  }, "Invalid ISO date");

export type WindowResult = {
  startDate: IsoDate;
  endDate: IsoDate;
  days: number;
};

export function resolveWindow(
  window: Window,
  today: Date = new Date(),
): WindowResult {
  const days = WINDOW_DAYS[window];
  const endDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const startDate = new Date(endDate);

  startDate.setUTCDate(endDate.getUTCDate() - (days - 1));
  return {
    startDate: toIsoDate(startDate),
    endDate: toIsoDate(endDate),
    days,
  };
}

export function resolvePreviousWindow(
  window: Window,
  today: Date = new Date(),
): WindowResult {
  const { startDate, days } = resolveWindow(window, today);

  const _startDate = new Date(`${startDate}T00:00:00.000Z`);

  const newEndDate = new Date(_startDate);
  newEndDate.setUTCDate(newEndDate.getUTCDate() - 1);

  const newStartDate = new Date(newEndDate);
  newStartDate.setUTCDate(newStartDate.getUTCDate() - (days - 1));

  return {
    startDate: toIsoDate(newStartDate),
    endDate: toIsoDate(newEndDate),
    days,
  };
}
