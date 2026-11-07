
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

/**
 * The earliest local hour at which each slot is considered "reachable".
 * Used to block adding a future slot on today's date.
 * Past dates are never restricted.
 */
export const SLOT_START_HOUR = {
  BEFOREBREAKFAST: 0,   // midnight onwards
  AFTERBREAKFAST:  8,   // 08:00 onwards
  AFTERLUNCH:      12,  // 12:00 onwards
  AFTERDINNER:     17,  // 17:00 onwards
};

/**
 * Returns true when `slot` is still in the future for today's local time.
 * Always returns false for past dates (backlog entries are always allowed).
 *
 * @param {string} readingDateStr  "YYYY-MM-DD"
 * @param {string} slot            e.g. "AFTERDINNER"
 */
export function isSlotInFuture(readingDateStr, slot) {
  const todayStr = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" local
  if (readingDateStr !== todayStr) return false;           // past date → always ok

  const currentHour = new Date().getHours(); // local hour 0–23
  return currentHour < SLOT_START_HOUR[slot];
}

/**
 * Computes summary stats from an array of reading objects.
 * Returns null fields when there are no readings (empty state).
 */
export function computeStats(readings) {
  if (!readings.length) {
    return { count: 0, highest: null, lowest: null, average: null };
  }

  const values = readings.map((r) => r.value);
  const highest = Math.max(...values);
  const lowest  = Math.min(...values);
  const average = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;

  return { count: readings.length, highest, lowest, average };
}
