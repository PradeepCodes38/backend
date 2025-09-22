// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, getMe, changeAdminPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js"; // Named import

const router = express.Router();

// Register (only admin roles can create employee credentials)
router.post("/register", protect, admin, registerUser);

// Login
router.post("/login", loginUser);

// Get current user
router.get("/me", protect, getMe);

// Change admin password
router.put("/change-password", protect, admin, changeAdminPassword);

export default router;