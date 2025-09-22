import express from 'express';
import * as applicationController from '../controllers/applicationController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('resume'), applicationController.submitApplication);
router.get('/', applicationController.getAllApplications);
router.get('/job/:jobId', applicationController.getJobApplications);
router.put('/:id/status', applicationController.updateApplicationStatus);

export default router;