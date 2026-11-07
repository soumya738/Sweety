
export const VALID_SLOTS = [
  "BEFOREBREAKFAST",
  "AFTERBREAKFAST",
  "AFTERLUNCH",
  "AFTERDINNER",
];

export const SLOT_DISPLAY = {
  BEFOREBREAKFAST: "Morning (fasting)",
  AFTERBREAKFAST: "After breakfast",
  AFTERLUNCH: "After lunch",
  AFTERDINNER: "After dinner",
};

export const SLOT_ORDER = {
  BEFOREBREAKFAST: 1,
  AFTERBREAKFAST: 2,
  AFTERLUNCH: 3,
  AFTERDINNER: 4,
};

export const MAX_READINGS_PER_DAY = 4;

export function validateValue(value) {
  if (value === undefined || value === null || value === "") {
    return "Please enter a glucose value.";
  }

  // Accept integer numbers and digit-only strings.
  const validInput =
    (typeof value === "number" && Number.isInteger(value)) ||
    (typeof value === "string" && /^\d+$/.test(value));

  if (!validInput || Number(value) < 40 || Number(value) > 600) {
    return "Value must be an integer between 40 and 600 mg/dL.";
  }

  return null;
}

export function parseDateParam(raw) {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { error: "readingDate must be in YYYY-MM-DD format." };
  }

  const date = new Date(`${raw}T00:00:00.000Z`);

  // Round-trip check rejects impossible dates like February 30.
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== raw
  ) {
    return { error: "Please provide a valid calendar date." };
  }

  return { date };
}

export function getTodayUTC() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

export function isFutureDate(date) {
  return date > getTodayUTC();
}

export function formatReading(reading) {
  return {
    ...reading,
    slotDisplay: SLOT_DISPLAY[reading.slot],
  };
}

export function isUniqueConstraintError(error) {
  return error?.code === "P2002";
}
