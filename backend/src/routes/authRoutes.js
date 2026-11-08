import express from "express";
import { register, login, logout, me, updatePassword } from "../controllers/authController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, me);   // session restore on page refresh
router.put("/password", protect, updatePassword);

export default router;