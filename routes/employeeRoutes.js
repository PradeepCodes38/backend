// routes/employeeRoutes.js
import express from "express";
import {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  changeEmployeePassword,
  createEmployee,
  getCurrentEmployee, // Add this
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get current employee data
router.get("/me", protect, getCurrentEmployee);

// Create employee (needs multer middleware for multipart/form-data)
import multer from "multer";
const upload = multer();
router.post("/", protect, upload.none(), createEmployee);

// Get all employees
router.get("/", protect, getEmployees);

// Get single employee
router.get("/:id", protect, getEmployeeById);

// Update employee
router.put("/:id", protect, updateEmployee);

// Delete employee
router.delete("/:id", protect, deleteEmployee);

// Change employee password
router.put("/:id/change-password", protect, changeEmployeePassword);

export default router;