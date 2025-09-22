import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import {
  getGovApplications,
  getGovApplicationById,
  createGovApplication,
  updateGovApplication,
  updateGovApplicationStatus,
  exportApplications,
} from "../controllers/GovApplicationController.js";

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/photos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - received file:', file);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
router.get("/", getGovApplications);
router.post("/", (req, res, next) => {
  console.log('POST /applications - Before multer');
  next();
}, upload.single("photo"), (req, res, next) => {
  console.log('POST /applications - After multer, file:', req.file);
  next();
}, createGovApplication);

router.get("/export/csv", exportApplications);
router.get("/:id", getGovApplicationById);
router.put("/:id", updateGovApplication);
router.put("/:id/status", updateGovApplicationStatus);

export default router;