import { prisma } from "../config/db.js";
import {
    parseDateParam,
    getTodayUTC,
    isFutureDate,
    formatReading,
    computeStats,
    SLOT_ORDER,
    parseTimezoneOffset,
} from "../utils/reading.utils.js";
import {
    firstOfMonth,
    lastOfMonth,
    toDateString,
    parseMonthParam,
    resolveDateRange,
} from "../utils/report.utils.js";

// ─── GET /report ──────────────────────────────────────────────────────────────
const getReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, date, month } = req.query;
        const { offset, error: timezoneError } = parseTimezoneOffset(
            req.get("X-Timezone-Offset")
        );
        if (timezoneError) {
            return res.status(400).json({ error: timezoneError });
        }

        // ── Validate type ──────────────────────────────────────────────────────
        const VALID_TYPES = ["daily", "mtd", "monthly"];
        if (!type || !VALID_TYPES.includes(type)) {
            return res.status(400).json({
                error: `type is required and must be one of: ${VALID_TYPES.join(", ")}`,
            });
        }

        let from, to;

        // ── monthly: uses ?month=YYYY-MM ───────────────────────────────────────
        if (type === "monthly") {
            let year, monthIndex;

            if (month) {
                const parsed = parseMonthParam(month);
                if (parsed.error) return res.status(400).json({ error: parsed.error });
                year       = parsed.year;
                monthIndex = parsed.month;
            } else {
                // Default to current month
                const today = getTodayUTC();
                year       = today.getUTCFullYear();
                monthIndex = today.getUTCMonth();
            }

            from = new Date(Date.UTC(year, monthIndex, 1));
            to   = lastOfMonth(from);

        // ── daily & mtd: use ?date=YYYY-MM-DD ─────────────────────────────────
        } else {
            let anchor;

            if (date) {
                const { date: parsed, error } = parseDateParam(date);
                if (error) return res.status(400).json({ error });
                anchor = parsed;
            } else {
                anchor = getTodayUTC();
            }

            if (isFutureDate(anchor, offset)) {
                return res.status(400).json({ error: "Date cannot be in the future." });
            }

            if (type === "daily") {
                from = anchor;
                to   = anchor;
            } else {
                // mtd: 1st of month → selected date
                from = firstOfMonth(anchor);
                to   = anchor;
            }
        }

        // ── Fetch readings ─────────────────────────────────────────────────────
        const rawReadings = await prisma.reading.findMany({
            where: {
                userId,
                readingDate: { gte: from, lte: to },
            },
            select: {
                id:          true,
                readingDate: true,
                slot:        true,
                value:       true,
                createdAt:   true,
            },
        });

        // Sort by date then by slot meal-order
        rawReadings.sort((a, b) => {
            const dateDiff = new Date(a.readingDate) - new Date(b.readingDate);
            if (dateDiff !== 0) return dateDiff;
            return SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot];
        });

        const stats = computeStats(rawReadings);

        // Daily includes the full reading list; mtd and monthly return stats only
        const readings =
            type === "daily" ? rawReadings.map(formatReading) : undefined;

        return res.status(200).json({
            status: "success",
            data: {
                reportType: type,
                dateRange: {
                    from: toDateString(from),
                    to:   toDateString(to),
                },
                stats,
                ...(readings !== undefined && { readings }),
            },
        });
    } catch (error) {
        console.error("getReport error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { getReport };
