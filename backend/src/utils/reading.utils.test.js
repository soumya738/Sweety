
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

import { computeStats } from "./reading.utils.js";

// ─── computeStats ─────────────────────────────────────────────────────────────

test("returns null stats for an empty readings array", () => {
  assert.deepEqual(computeStats([]), {
    count: 0,
    highest: null,
    lowest: null,
    average: null,
  });
});

test("computes correct stats for a single reading", () => {
  assert.deepEqual(computeStats([{ value: 100 }]), {
    count: 1,
    highest: 100,
    lowest: 100,
    average: 100,
  });
});

test("computes correct stats for multiple readings", () => {
  const readings = [
    { value: 84 },
    { value: 142 },
    { value: 100 },
  ];
  assert.deepEqual(computeStats(readings), {
    count: 3,
    highest: 142,
    lowest: 84,
    average: 108.7,
  });
});

test("rounds average to 1 decimal place", () => {
  // 84 + 85 + 86 = 255 / 3 = 85.0 exactly
  assert.equal(computeStats([{ value: 84 }, { value: 85 }, { value: 86 }]).average, 85);

  // 100 + 101 = 201 / 2 = 100.5
  assert.equal(computeStats([{ value: 100 }, { value: 101 }]).average, 100.5);

  // 40 + 600 + 123 = 763 / 3 = 254.333... → rounds to 254.3
  assert.equal(computeStats([{ value: 40 }, { value: 600 }, { value: 123 }]).average, 254.3);
});

test("handles boundary glucose values (40 and 600)", () => {
  const result = computeStats([{ value: 40 }, { value: 600 }]);
  assert.equal(result.highest, 600);
  assert.equal(result.lowest, 40);
  assert.equal(result.average, 320);
});

test("count matches number of readings passed in", () => {
  const readings = Array.from({ length: 4 }, (_, i) => ({ value: 100 + i }));
  assert.equal(computeStats(readings).count, 4);
});
