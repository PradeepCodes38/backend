import express from 'express';
import { getStats } from '../controllers/govController.js';

const router = express.Router();

// Dashboard statistics
router.get('/stats', getStats);

export default router;