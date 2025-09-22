import express from 'express';
import * as jobController from '../controllers/jobController.js';

const router = express.Router();

router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);
router.post('/', jobController.createJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

export default router;