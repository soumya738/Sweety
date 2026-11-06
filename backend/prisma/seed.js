import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const creatorId = "95e37d83-66e8-44e9-836d-9df7288a85f5"

const readings = [
  { readingDate: "2026-11-01", value: 105, slot: "BEFOREBREAKFAST" },
  { readingDate: "2026-11-01", value: 145, slot: "AFTERBREAKFAST" },
  { readingDate: "2026-11-01", value: 132, slot: "AFTERLUNCH" },
  { readingDate: "2026-11-01", value: 118, slot: "AFTERDINNER" },

  { readingDate: "2026-11-02", value: 98, slot: "BEFOREBREAKFAST" },
  { readingDate: "2026-11-02", value: 156, slot: "AFTERBREAKFAST" },
  { readingDate: "2026-11-02", value: 140, slot: "AFTERLUNCH" },
  { readingDate: "2026-11-02", value: 125, slot: "AFTERDINNER" },

  { readingDate: "2026-11-03", value: 112, slot: "BEFOREBREAKFAST" },
  { readingDate: "2026-11-03", value: 168, slot: "AFTERBREAKFAST" },
  { readingDate: "2026-11-03", value: 135, slot: "AFTERLUNCH" },
  { readingDate: "2026-11-03", value: 120, slot: "AFTERDINNER" },

  { readingDate: "2026-11-04", value: 102, slot: "BEFOREBREAKFAST" },
  { readingDate: "2026-11-04", value: 152, slot: "AFTERBREAKFAST" },
  { readingDate: "2026-11-04", value: 143, slot: "AFTERLUNCH" },
  { readingDate: "2026-11-04", value: 130, slot: "AFTERDINNER" },

  { readingDate: "2026-11-05", value: 109, slot: "BEFOREBREAKFAST" },
  { readingDate: "2026-11-05", value: 250, slot: "AFTERBREAKFAST" },
  { readingDate: "2026-11-05", value: 155, slot: "AFTERLUNCH" },
  { readingDate: "2026-11-05", value: 128, slot: "AFTERDINNER" },
];

async function main() {
  const result = await prisma.reading.createMany({
    data: readings.map((reading) => ({
      ...reading,
      readingDate: new Date(`${reading.readingDate}T00:00:00.000Z`),
      userId: creatorId,
    })),
    skipDuplicates: true,
  });

  console.log(`Successfully inserted ${result.count} readings`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });