
import test from "node:test";
import assert from "node:assert/strict";

import {
  validateValue,
  parseDateParam,
  isFutureDate,
  formatReading,
  SLOT_DISPLAY,
  SLOT_ORDER,
  VALID_SLOTS,
  getTodayUTC,
} from "./reading.utils.js";

// Glucose validation
test("accepts valid glucose values", () => {
  assert.equal(validateValue(84), null);
  assert.equal(validateValue(40), null);
  assert.equal(validateValue(600), null);
  assert.equal(validateValue("120"), null);
});

test("rejects missing glucose values", () => {
  assert.ok(validateValue(undefined));
  assert.ok(validateValue(null));
  assert.ok(validateValue(""));
});

test("rejects invalid glucose values", () => {
  assert.ok(validateValue(39));
  assert.ok(validateValue(601));
  assert.ok(validateValue(84.5));
  assert.ok(validateValue("abc"));
  assert.ok(validateValue("84.5"));
});

// Date validation
test("accepts a valid reading date", () => {
  const result = parseDateParam("2026-11-07");

  assert.equal(result.error, undefined);
  assert.equal(
    result.date.toISOString(),
    "2026-11-07T00:00:00.000Z"
  );
});

test("rejects invalid date formats", () => {
  assert.ok(parseDateParam("07-11-2026").error);
  assert.ok(parseDateParam("2026/11/07").error);
  assert.ok(parseDateParam("").error);
  assert.ok(parseDateParam(undefined).error);
});

test("rejects impossible calendar dates", () => {
  assert.ok(parseDateParam("2026-02-30").error);
  assert.ok(parseDateParam("2026-13-01").error);
  assert.ok(parseDateParam("2026-04-31").error);
});

test("rejects future reading dates", () => {
  const tomorrow = getTodayUTC();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  assert.equal(isFutureDate(tomorrow), true);
});

// Slot validation and formatting
test("contains exactly four valid reading slots", () => {
  assert.equal(VALID_SLOTS.length, 4);

  VALID_SLOTS.forEach((slot) => {
    assert.ok(SLOT_DISPLAY[slot]);
  });
});

test("formats a reading with its display label", () => {
  const reading = {
    id: "test-id",
    slot: "BEFOREBREAKFAST",
    value: 84,
  };

  assert.deepEqual(formatReading(reading), {
    ...reading,
    slotDisplay: "Morning (fasting)",
  });
});

test("maintains the correct slot order", () => {
  assert.deepEqual(
    [...VALID_SLOTS].sort(
      (a, b) => SLOT_ORDER[a] - SLOT_ORDER[b]
    ),
    [
      "BEFOREBREAKFAST",
      "AFTERBREAKFAST",
      "AFTERLUNCH",
      "AFTERDINNER",
    ]
  );
});
