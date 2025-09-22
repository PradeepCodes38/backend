import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as applicationController from '../controllers/applicationController.js';
import Job from '../models/Job.js'; // Added for the /jobs route

const router = express.Router();

// Dashboard stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// Job management routes
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Application management routes
router.get('/applications', applicationController.getAllApplications);
router.get('/applications/job/:jobId', applicationController.getJobApplications);
router.put('/applications/:id/status', applicationController.updateApplicationStatus);

export default router;