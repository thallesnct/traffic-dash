import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getDatabaseUrl } from "../src/database/database-url";
import { COUNTRY_SEEDS } from "./data/countries";
import { VEHICLE_TYPE_SEEDS } from "./data/vehicle-types";

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

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
    VEHICLE_TYPE_SEEDS.map((vehicleType) =>
      prisma.vehicleType.upsert({
        where: { code: vehicleType.code },
        create: vehicleType,
        update: { name: vehicleType.name },
      }),
    ),
  );
}

async function main(): Promise<void> {
  await seedCountries();
  await seedVehicleTypes();

  console.log(
    `Seeded ${COUNTRY_SEEDS.length} countries and ${VEHICLE_TYPE_SEEDS.length} vehicle types.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
