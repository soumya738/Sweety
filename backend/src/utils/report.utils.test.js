import test from "node:test";
import assert from "node:assert/strict";

import {
    firstOfMonth,
    lastOfMonth,
    toDateString,
    parseMonthParam,
    resolveDateRange,
} from "./report.utils.js";

// ─── firstOfMonth ─────────────────────────────────────────────────────────────

test("firstOfMonth returns the 1st at UTC midnight", () => {
    const date = new Date("2026-10-15T00:00:00.000Z");
    assert.equal(toDateString(firstOfMonth(date)), "2026-10-01");
});

test("firstOfMonth works for January (month boundary)", () => {
    const date = new Date("2026-01-20T00:00:00.000Z");
    assert.equal(toDateString(firstOfMonth(date)), "2026-01-01");
});

// ─── lastOfMonth ──────────────────────────────────────────────────────────────

test("lastOfMonth returns the correct last day for a 31-day month", () => {
    const date = new Date("2026-10-01T00:00:00.000Z");
    assert.equal(toDateString(lastOfMonth(date)), "2026-10-31");
});

test("lastOfMonth returns the correct last day for a 30-day month", () => {
    const date = new Date("2026-09-01T00:00:00.000Z");
    assert.equal(toDateString(lastOfMonth(date)), "2026-09-30");
});

test("lastOfMonth handles February in a non-leap year", () => {
    const date = new Date("2026-02-01T00:00:00.000Z");
    assert.equal(toDateString(lastOfMonth(date)), "2026-02-28");
});

test("lastOfMonth handles February in a leap year", () => {
    const date = new Date("2024-02-01T00:00:00.000Z");
    assert.equal(toDateString(lastOfMonth(date)), "2024-02-29");
});

test("lastOfMonth handles December → does not spill into next year", () => {
    const date = new Date("2026-12-01T00:00:00.000Z");
    assert.equal(toDateString(lastOfMonth(date)), "2026-12-31");
});

// ─── toDateString ─────────────────────────────────────────────────────────────

test("toDateString formats a UTC date correctly", () => {
    assert.equal(toDateString(new Date("2026-10-15T00:00:00.000Z")), "2026-10-15");
});

test("toDateString zero-pads single-digit months and days", () => {
    assert.equal(toDateString(new Date("2026-01-07T00:00:00.000Z")), "2026-01-07");
});

// ─── parseMonthParam ──────────────────────────────────────────────────────────

test("parses a valid YYYY-MM string", () => {
    const result = parseMonthParam("2026-10");
    assert.equal(result.error, undefined);
    assert.equal(result.year, 2026);
    assert.equal(result.month, 9); // 0-indexed
});

test("parses January correctly (month 0)", () => {
    const result = parseMonthParam("2026-01");
    assert.equal(result.month, 0);
});

test("parses December correctly (month 11)", () => {
    const result = parseMonthParam("2026-12");
    assert.equal(result.month, 11);
});

test("rejects wrong format DD-MM-YYYY", () => {
    assert.ok(parseMonthParam("15-10-2026").error);
});

test("rejects full date string YYYY-MM-DD", () => {
    assert.ok(parseMonthParam("2026-10-15").error);
});

test("rejects month 00", () => {
    assert.ok(parseMonthParam("2026-00").error);
});

test("rejects month 13", () => {
    assert.ok(parseMonthParam("2026-13").error);
});

test("rejects empty string", () => {
    assert.ok(parseMonthParam("").error);
});

test("rejects undefined", () => {
    assert.ok(parseMonthParam(undefined).error);
});

// ─── resolveDateRange ─────────────────────────────────────────────────────────

test("daily range is the anchor date itself", () => {
    const anchor = new Date("2026-10-15T00:00:00.000Z");
    const { from, to } = resolveDateRange("daily", anchor);
    assert.equal(toDateString(from), "2026-10-15");
    assert.equal(toDateString(to),   "2026-10-15");
});

test("mtd range goes from 1st of month to anchor", () => {
    const anchor = new Date("2026-10-15T00:00:00.000Z");
    const { from, to } = resolveDateRange("mtd", anchor);
    assert.equal(toDateString(from), "2026-10-01");
    assert.equal(toDateString(to),   "2026-10-15");
});

test("mtd range on the 1st of the month returns a single-day range", () => {
    const anchor = new Date("2026-10-01T00:00:00.000Z");
    const { from, to } = resolveDateRange("mtd", anchor);
    assert.equal(toDateString(from), "2026-10-01");
    assert.equal(toDateString(to),   "2026-10-01");
});

test("returns null for an unknown report type", () => {
    const anchor = new Date("2026-10-15T00:00:00.000Z");
    assert.equal(resolveDateRange("weekly", anchor), null);
});
