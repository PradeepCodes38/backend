import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ES Module Setup (recreate __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not defined in the environment variables");
  console.error("Please create a .env file with your MongoDB connection string");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined in the environment variables");
  console.error("Please create a .env file with your JWT secret");
  process.exit(1);
}

// DB Connection
import connectDB from "./config/db.js";
connectDB();

// Import Routes
// Employee Management Routes
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";

// Job Portal Routes
import govJobRoutes from "./routes/jobRoutes.js";
import govApplicationRoutes from "./routes/applicationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import jobsRouter from "./routes/jobs.js";
import applicationsRouter from "./routes/applications.js";
import adminRouter from "./routes/admin.js";
import documentRoutes from "./routes/documentRoutes.js";

// Initialize express app
const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://thebrilliantbihar.com", // CRA
      "http://localhost:5173", // Vite
      "http://127.0.0.1:5173",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads Directory Setup
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Routes
// Employee Management APIs
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use('/api/documents', documentRoutes);

// Job Portal APIs
// Gov side
app.use("/api/gov/jobs", govJobRoutes);
app.use("/api/gov/applications", govApplicationRoutes);
app.use("/api/gov/dashboard", dashboardRoutes);
app.use("/api/payments", paymentRoutes);
// Company side
app.use("/api/jobs", jobsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/admin", adminRouter);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    message: "API is running 🚀",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Error Handling
// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📂 Uploads directory: ${uploadsDir}`);
  console.log(`📊 Dashboard Stats: http://localhost:${PORT}/api/gov/dashboard/stats`);
});
