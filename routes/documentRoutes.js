// routes/documentRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  uploadDocuments, 
  getEmployeeDocuments, 
  deleteDocument,
  getMyDocuments
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Multer storage setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads/documents");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// --- File filter ---
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed."), false);
  }
};

// --- Multer instance ---
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5,                    // Max 5 files
  },
});

// --- Routes ---

// Admin uploads documents
router.post("/upload", protect, upload.array("documents", 5), uploadDocuments);

// Admin gets documents for a specific employee
router.get("/employee/:employeeId", protect, getEmployeeDocuments);

// Employee gets their own documents
router.get("/my-documents", protect, getMyDocuments);

// Delete document (admin or upload owner, depending on your logic)
router.delete("/:id", protect, deleteDocument);

export default router;
