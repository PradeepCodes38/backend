import path from "path";
import fs from "fs";
import Document from "../models/Document.js";
import User from "../models/User.js";

// @desc    Upload documents for an employee
// @route   POST /api/documents/upload
// @access  Private/Admin
export const uploadDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { employeeId, documentType, description } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const uploadedDocuments = [];

    // Process each uploaded file
    for (const file of req.files) {
      const document = new Document({
        employeeId,
        name: file.originalname,
        documentType,
        description,
        filePath: file.path,
        uploadedBy: req.user._id,
        uploadDate: new Date(),
      });

      const savedDocument = await document.save();
      uploadedDocuments.push(savedDocument);
    }

    res.status(201).json({
      message: "Documents uploaded successfully",
      documents: uploadedDocuments,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ message: "Server error during document upload" });
  }
};

// @desc    Get documents for an employee
// @route   GET /api/documents/employee/:employeeId
// @access  Private/Admin
export const getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const documents = await Document.find({ employeeId })
      .populate("uploadedBy", "name")
      .sort({ uploadDate: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private/Admin
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current employee's documents
// @route   GET /api/documents/my-documents
// @access  Private/Employee
export const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ employeeId: req.user._id })
      .populate("uploadedBy", "name")
      .sort({ uploadDate: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Get my documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
