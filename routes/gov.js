import express from "express";
import {
  getStats,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  getAllApplications,
  updateApplicationStatus,
  exportApplicationsToCSV,
} from "../controllers/govController.js";

const router = express.Router();

// Dashboard statistics
router.get("/stats", getStats);

// Job routes
router.get("/jobs", getAllJobs);
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);

// Application routes
router.get("/applications", getAllApplications);
router.put("/applications/:id/status", updateApplicationStatus);
router.get("/applications/export/csv", exportApplicationsToCSV);

export default router;
