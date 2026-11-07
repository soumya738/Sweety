import express from "express";
import { addToReadings, getReadings, editReading, deleteReading } from "../controllers/readingsController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// All readings routes require a valid JWT
router.post("/",    protect, addToReadings);   // Add a reading
router.get("/",     protect, getReadings);     // Get readings for a day
router.put("/:id",  protect, editReading);     // Edit a reading's value
router.delete("/:id", protect, deleteReading); // Delete a reading

export default router;
