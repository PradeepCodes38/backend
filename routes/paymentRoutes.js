import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// Add request logging middleware for debugging
router.use((req, res, next) => {
  console.log(`Payment API: ${req.method} ${req.path}`, req.body);
  next();
});

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

export default router;