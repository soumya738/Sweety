import express from "express";
import { addToReadings, getReadings, editReading, deleteReading } from "../controllers/readingsController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/",    protect, addToReadings);
router.get("/",     protect, getReadings);
router.put("/:id",  protect, editReading);
router.delete("/:id", protect, deleteReading);

export default router;
