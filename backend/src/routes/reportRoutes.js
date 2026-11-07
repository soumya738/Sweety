import express from "express";
import { getReport } from "../controllers/reportController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// GET /report?type=daily|mtd|monthly&date=YYYY-MM-DD
router.get("/", protect, getReport);

export default router;
