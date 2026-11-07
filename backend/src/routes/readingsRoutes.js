import express from "express";
import { addToReadings, getReadings } from "../controllers/readingsController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// All readings routes require a valid JWT
router.post("/", protect, addToReadings);
router.get("/", protect, getReadings);

export default router;
