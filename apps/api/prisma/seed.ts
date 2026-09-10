import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseUrl } from "../src/database/database-url";
import { COUNTRY_SEEDS } from "./data/countries";
import { VEHICLE_TYPE_SEEDS } from "./data/vehicle-types";
import { countryDaySeed, createGenerator, DAY_COUNT } from "./random";

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

const BATCH_SIZE = 2000;
const WEEKEND_FACTOR = 0.65;
const MAJOR_COUNTRY_SCALE = 1;
const MINOR_COUNTRY_SCALE = 0.08;

const MAJOR_COUNTRY_CODES = new Set([
  "US",
  "CN",
  "IN",
  "BR",
  "RU",
  "JP",
  "DE",
  "GB",
  "FR",
  "IT",
  "CA",
  "AU",
  "ES",
  "MX",
  "KR",
  "ID",
  "TR",
  "SA",
  "NL",
  "PL",
  "AR",
  "ZA",
  "EG",
  "NG",
  "TH",
  "VN",
  "PH",
  "PK",
  "BD",
  "NZ",
]);

const VEHICLES_BY_CODE = [...VEHICLE_TYPE_SEEDS].sort((left, right) =>
  left.code < right.code ? -1 : 1,
);

async function seedCountries(): Promise<void> {
  await prisma.$transaction(
    COUNTRY_SEEDS.map((country) =>
      prisma.country.upsert({
        where: { code: country.code },
        create: country,
        update: { name: country.name },
      }),
    ),
  );
}

async function seedVehicleTypes(): Promise<void> {
  await prisma.$transaction(
    VEHICLE_TYPE_SEEDS.map(({ code, name }) =>
      prisma.vehicleType.upsert({
        where: { code },
        create: { code, name },
        update: { name },
      }),
    ),
  );
}

function utcMidnightToday(): Date {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function subtractUtcDays(date: Date, days: number): Date {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() - days);

  return shifted;
}

function weekendFactor(date: Date): number {
  const weekday = date.getUTCDay();

  return weekday === 0 || weekday === 6 ? WEEKEND_FACTOR : 1;
}

async function seedDailyTraffic(): Promise<number> {
  const today = utcMidnightToday();
  const batch: {
    recordedDate: Date;
    countryCode: string;
    vehicleType: string;
    vehicleCount: number;
  }[] = [];

  let attempted = 0;

  const flush = async (): Promise<void> => {
    await prisma.dailyTraffic.createMany({ data: batch, skipDuplicates: true });
    batch.length = 0;
  };

  for (let dayOffset = DAY_COUNT - 1; dayOffset >= 0; dayOffset -= 1) {
    const recordedDate = subtractUtcDays(today, dayOffset);
    const dayFactor = weekendFactor(recordedDate);

    for (const { code } of COUNTRY_SEEDS) {
      const countryScale = MAJOR_COUNTRY_CODES.has(code)
        ? MAJOR_COUNTRY_SCALE
        : MINOR_COUNTRY_SCALE;
      const draw = createGenerator(countryDaySeed(code, dayOffset));

      for (const vehicle of VEHICLES_BY_CODE) {
        const scaled =
          vehicle.baseline * countryScale * dayFactor * (0.85 + 0.3 * draw());

        batch.push({
          recordedDate,
          countryCode: code,
          vehicleType: vehicle.code,
          vehicleCount: Math.max(0, Math.round(scaled)),
        });
        attempted += 1;
      }
    }

    if (batch.length >= BATCH_SIZE) await flush();
  }

  if (batch.length > 0) await flush();

  return attempted;
}

async function main(): Promise<void> {
  await seedCountries();
  await seedVehicleTypes();

  const attempted = await seedDailyTraffic();

  console.log(
    `Seeded ${COUNTRY_SEEDS.length} countries and ${VEHICLE_TYPE_SEEDS.length} vehicle types.`,
  );
  console.log(`Attempted ${attempted} daily traffic rows.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
