import { prisma } from "../config/db.js";

// Valid slot values matching the Prisma enum
const VALID_SLOTS = ["BEFOREBREAKFAST", "AFTERBREAKFAST", "AFTERLUNCH", "AFTERDINNER"];

// POST /readings
// Body: { value: number, readingDate: "YYYY-MM-DD", slot: "BEFOREBREAKFAST" | ... }
const addToReadings = async (req, res) => {
    try {
        const { value, readingDate, slot } = req.body;
        const userId = req.user.id;

        // --- Input validation ---
        if (value === undefined || !readingDate || !slot) {
            return res.status(400).json({ error: "value, readingDate and slot are required" });
        }

        if (!VALID_SLOTS.includes(slot)) {
            return res
                .status(400)
                .json({ error: `slot must be one of: ${VALID_SLOTS.join(", ")}` });
        }

        const parsedValue = Number(value);
        if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
            return res.status(400).json({ error: "value must be a positive integer (mg/dL)" });
        }

        // --- Date validation ---
        // Parse as date-only (no time component) to avoid timezone shifts
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(readingDate)) {
            return res
                .status(400)
                .json({ error: "readingDate must be in YYYY-MM-DD format" });
        }

        const inputDate = new Date(readingDate + "T00:00:00.000Z");
        if (isNaN(inputDate.getTime())) {
            return res.status(400).json({ error: "readingDate is not a valid date" });
        }

        // Compare against today (UTC date) — future dates are not allowed
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);
        if (inputDate > todayUTC) {
            return res
                .status(400)
                .json({ error: "readingDate cannot be in the future" });
        }

        // --- Duplicate check: same user + date + slot ---
        const existing = await prisma.reading.findUnique({
            where: {
                userId_readingDate_slot: {
                    userId,
                    readingDate: inputDate,
                    slot,
                },
            },
        });

        if (existing) {
            return res.status(400).json({
                error: `You have already added a reading for ${slot} on ${readingDate}`,
            });
        }

        // --- Create the reading ---
        const reading = await prisma.reading.create({
            data: {
                userId,
                readingDate: inputDate,
                slot,
                value: parsedValue,
            },
            select: {
                id: true,
                readingDate: true,
                slot: true,
                value: true,
                createdAt: true,
            },
        });

        return res.status(201).json({
            status: "success",
            data: { reading },
        });
    } catch (error) {
        console.error("addToReadings error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// GET /readings?date=YYYY-MM-DD
// Returns all readings for the logged-in user on the given date (defaults to today)
const getReadings = async (req, res) => {
    try {
        const userId = req.user.id;
        const dateParam = req.query.date;

        let targetDate;

        if (dateParam) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dateParam)) {
                return res
                    .status(400)
                    .json({ error: "date query param must be in YYYY-MM-DD format" });
            }
            targetDate = new Date(dateParam + "T00:00:00.000Z");
            if (isNaN(targetDate.getTime())) {
                return res.status(400).json({ error: "date is not a valid date" });
            }
        } else {
            // Default to today (UTC)
            targetDate = new Date();
            targetDate.setUTCHours(0, 0, 0, 0);
        }

        const readings = await prisma.reading.findMany({
            where: {
                userId,
                readingDate: targetDate,
            },
            select: {
                id: true,
                readingDate: true,
                slot: true,
                value: true,
                createdAt: true,
            },
            // Return in meal order
            orderBy: {
                slot: "asc",
            },
        });

        return res.status(200).json({
            status: "success",
            data: {
                date: targetDate.toISOString().split("T")[0],
                count: readings.length,
                readings,
            },
        });
    } catch (error) {
        console.error("getReadings error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { addToReadings, getReadings };
