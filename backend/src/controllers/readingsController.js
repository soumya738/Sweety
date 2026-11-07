
import { prisma } from "../config/db.js";

import {
  VALID_SLOTS,
  SLOT_DISPLAY,
  SLOT_ORDER,
  MAX_READINGS_PER_DAY,
  validateValue,
  parseDateParam,
  isFutureDate,
  formatReading,
  isUniqueConstraintError,
} from "../utils/reading.utils.js";

const READING_SELECT = {
  id: true,
  readingDate: true,
  slot: true,
  value: true,
  createdAt: true,
};

const UPDATED_READING_SELECT = {
  id: true,
  readingDate: true,
  slot: true,
  value: true,
  updatedAt: true,
};

const errorResponse = (res, status, message) =>
  res.status(status).json({ error: message });

const serverError = (res, error, operation) => {
  console.error(`${operation} error:`, error);
  return errorResponse(res, 500, "Internal server error.");
};

// POST /readings
const addToReadings = async (req, res) => {
  try {
    const { value, readingDate, slot } = req.body ?? {};
    const userId = req.user.id;

    const valueError = validateValue(value);
    if (valueError) return errorResponse(res, 400, valueError);

    if (!VALID_SLOTS.includes(slot)) {
      return errorResponse(res, 400, "Please select a valid time slot.");
    }

    const { date, error } = parseDateParam(readingDate);
    if (error) return errorResponse(res, 400, error);

    if (isFutureDate(date)) {
      return errorResponse(res, 400, "Date cannot be in the future.");
    }

    const where = { userId, readingDate: date };

    const count = await prisma.reading.count({ where });

    if (count >= MAX_READINGS_PER_DAY) {
      return errorResponse(
        res,
        400,
        "You can add only 4 readings per day."
      );
    }

    const existing = await prisma.reading.findUnique({
      where: {
        userId_readingDate_slot: { ...where, slot },
      },
    });

    if (existing) {
      return errorResponse(
        res,
        409,
        `You already have a ${SLOT_DISPLAY[slot]} reading for this date.`
      );
    }

    const reading = await prisma.reading.create({
      data: {
        ...where,
        slot,
        value: Number(value),
      },
      select: READING_SELECT,
    });

    return res.status(201).json({
      status: "success",
      data: { reading: formatReading(reading) },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return errorResponse(
        res,
        409,
        "A reading already exists for this date and time slot."
      );
    }

    return serverError(res, error, "addToReadings");
  }
};

// GET /readings?date=YYYY-MM-DD
const getReadings = async (req, res) => {
  try {
    const userId = req.user.id;

    const dateParam = req.query.date;
    let targetDate;

    if (dateParam) {
      const { date, error } = parseDateParam(dateParam);
      if (error) return errorResponse(res, 400, error);
      targetDate = date;
    } else {
      targetDate = new Date();
      targetDate.setUTCHours(0, 0, 0, 0);
    }

    const readings = await prisma.reading.findMany({
      where: { userId, readingDate: targetDate },
      select: READING_SELECT,
    });

    readings.sort(
      (a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]
    );

    const formatted = readings.map(formatReading);

    return res.status(200).json({
      status: "success",
      data: {
        date: targetDate.toISOString().slice(0, 10),
        count: formatted.length,
        readings: formatted,
      },
    });
  } catch (error) {
    return serverError(res, error, "getReadings");
  }
};

// PUT /readings/:id
const editReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body ?? {};
    const userId = req.user.id;

    const valueError = validateValue(value);
    if (valueError) return errorResponse(res, 400, valueError);

    // Update only if the reading belongs to the authenticated user.
    const result = await prisma.reading.updateMany({
      where: { id, userId },
      data: { value: Number(value) },
    });

    if (result.count === 0) {
      return errorResponse(res, 404, "Reading not found.");
    }

    const updated = await prisma.reading.findFirst({
      where: { id, userId },
      select: UPDATED_READING_SELECT,
    });

    return res.status(200).json({
      status: "success",
      data: { reading: formatReading(updated) },
    });
  } catch (error) {
    return serverError(res, error, "editReading");
  }
};

// DELETE /readings/:id
const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Delete only if the reading belongs to the authenticated user.
    const result = await prisma.reading.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      return errorResponse(res, 404, "Reading not found.");
    }

    return res.status(200).json({
      status: "success",
      message: "Reading deleted successfully.",
    });
  } catch (error) {
    return serverError(res, error, "deleteReading");
  }
};

export {
  addToReadings,
  getReadings,
  editReading,
  deleteReading,
};
