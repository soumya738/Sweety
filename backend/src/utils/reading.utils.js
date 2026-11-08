
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

export function getTodayUTC(offsetMinutes = 0) {
  const localToday = new Date(Date.now() + offsetMinutes * 60_000)
    .toISOString()
    .slice(0, 10);
  return new Date(`${localToday}T00:00:00.000Z`);
}

export function parseTimezoneOffset(raw) {
  if (raw === undefined) return { offset: 0 };
  if (typeof raw !== "string" || !/^-?\d+$/.test(raw)) {
    return { error: "Timezone offset must be an integer number of minutes." };
  }

  const offset = Number(raw);
  if (!Number.isSafeInteger(offset) || offset < -840 || offset > 840) {
    return { error: "Timezone offset must be between -840 and 840 minutes." };
  }

  return { offset };
}

export function isFutureDate(date, offsetMinutes = 0) {
  return date > getTodayUTC(offsetMinutes);
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
export function isSlotInFuture(readingDateStr, slot, offsetMinutes = 0) {
  const localNow = new Date(Date.now() + offsetMinutes * 60_000);
  const todayStr = localNow.toISOString().slice(0, 10);
  if (readingDateStr !== todayStr) return false;           // past date → always ok

  const currentHour = localNow.getUTCHours(); // hour in the client's timezone
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
