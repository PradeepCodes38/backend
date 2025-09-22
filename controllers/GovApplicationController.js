import GovApplication from "../models/govApplicationModel.js";
import GovJob from "../models/govJobModel.js";
import path from "path";
import fs from "fs";

// @desc    Get all government applications
// @route   GET /api/gov/applications
// @access  Private (Admin)
export const getGovApplications = async (req, res) => {
  try {
    const applications = await GovApplication.find({})
      .populate("jobId", "title company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications: applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get a single government application by ID
// @route   GET /api/gov/applications/:id
// @access  Private (Admin)
export const getGovApplicationById = async (req, res) => {
  try {
    const application = await GovApplication.findById(req.params.id)
      .populate("jobId", "title company");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error fetching application by ID:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new government application
// @route   POST /api/gov/applications
// @access  Public
export const createGovApplication = async (req, res) => {
  try {
    console.log('Creating application...');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Check if photo is uploaded (using multer)
    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({
        success: false,
        message: "Please upload a passport size photo",
      });
    }

    // Validate required fields
    const requiredFields = ['name', 'fatherHusbandName', 'motherName', 'presentAddress', 'dob', 'mobile1', 'email'];
    for (let field of requiredFields) {
      if (!req.body[field] || req.body[field].trim() === '') {
        return res.status(400).json({
          success: false,
          message: `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`,
        });
      }
    }

    try {
      // Parse education and experience from JSON strings
      let education = [];
      let experience = [];

      try {
        education = req.body.education ? JSON.parse(req.body.education) : [];
      } catch (e) {
        console.log('Education parsing error:', e);
        education = [];
      }

      try {
        experience = req.body.experience ? JSON.parse(req.body.experience) : [];
      } catch (e) {
        console.log('Experience parsing error:', e);
        experience = [];
      }

      // Create application object
      const applicationData = {
        jobId: req.body.jobId || null,
        jobTitle: req.body.jobTitle || req.body.postAppliedFor,
        postAppliedFor: req.body.postAppliedFor,
        name: req.body.name.trim(),
        fatherHusbandName: req.body.fatherHusbandName.trim(),
        motherName: req.body.motherName.trim(),
        presentAddress: req.body.presentAddress.trim(),
        maritalStatus: req.body.maritalStatus || 'Single',
        gender: req.body.gender || 'Male',
        dob: req.body.dob,
        mobile1: req.body.mobile1.trim(),
        mobile2: req.body.mobile2?.trim() || '',
        panNo: req.body.panNo?.trim() || '',
        email: req.body.email.trim(),
        aadharNo: req.body.aadharNo?.trim() || '',
        photo: `/uploads/photos/${req.file.filename}`,
        education,
        experience,
        paymentStatus: req.body.paymentStatus || "completed",
        razorpay_payment_id: req.body.razorpay_payment_id,
        razorpay_order_id: req.body.razorpay_order_id,
        razorpay_signature: req.body.razorpay_signature,
        appliedDate: req.body.appliedDate || new Date(),
        status: req.body.status || 'pending',
        fee: req.body.fee,
        company: req.body.company,
        location: req.body.location,
      };

      console.log('Application data to save:', applicationData);

      // Create application
      const application = await GovApplication.create(applicationData);

      // Update job application count if jobId exists
      if (req.body.jobId) {
        await GovJob.findByIdAndUpdate(req.body.jobId, {
          $inc: { applicationCount: 1 },
        });
      }

      console.log('Application created successfully:', application._id);

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application,
      });
    } catch (parseError) {
      console.error('Application creation error:', parseError);
      res.status(400).json({
        success: false,
        message: "Error creating application",
        error: parseError.message,
      });
    }
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update a government application status
// @route   PUT /api/gov/applications/:id/status
// @access  Private (Admin)
export const updateGovApplicationStatus = async (req, res) => {
  try {
    const application = await GovApplication.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update a government application
// @route   PUT /api/gov/applications/:id
// @access  Private (Admin)
export const updateGovApplication = async (req, res) => {
  try {
    const application = await GovApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Export applications to CSV
// @route   GET /api/gov/applications/export/csv
// @access  Private (Admin)
export const exportApplications = async (req, res) => {
  try {
    const applications = await GovApplication.find({})
      .populate("jobId", "title company");

    let csv =
      "Application ID,Job Title,Name,Email,Phone,Status,Applied Date,Payment Status,Fee\n";

    applications.forEach((app) => {
      csv += `${app._id},${app.jobTitle || ''},${app.name || ''},${app.email || ''},${app.mobile1 || ''},${app.status || ''},${app.appliedDate || ''},${app.paymentStatus || ''},${app.fee || ''}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=applications.csv"
    );
    res.send(csv);
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};