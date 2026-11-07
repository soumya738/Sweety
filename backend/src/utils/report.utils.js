/** Returns the first day (UTC midnight) of the month that `date` belongs to. */
export function firstOfMonth(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/** Returns the last day (UTC midnight) of the month that `date` belongs to. */
export function lastOfMonth(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

/** Formats a Date to "YYYY-MM-DD" string. */
export function toDateString(date) {
    return date.toISOString().slice(0, 10);
}

/**
 * Parses a "YYYY-MM" month string.
 * Returns { year, month } (0-indexed month) or { error } on failure.
 */
export function parseMonthParam(raw) {
    if (typeof raw !== "string" || !/^\d{4}-\d{2}$/.test(raw)) {
        return { error: "month must be in YYYY-MM format (e.g. 2026-10)." };
    }
    const [year, month] = raw.split("-").map(Number);
    if (month < 1 || month > 12) {
        return { error: "month must be between 01 and 12." };
    }
    return { year, month: month - 1 }; // 0-indexed for Date.UTC
}

/**
 * Resolves { from, to } UTC Date objects for daily / mtd report types.
 * `anchor` must be a UTC-midnight Date.
 */
export function resolveDateRange(type, anchor) {
    switch (type) {
        case "daily":
            return { from: anchor, to: anchor };
        case "mtd":
            return { from: firstOfMonth(anchor), to: anchor };
        default:
            return null;
    }
}
