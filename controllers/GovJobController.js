import GovJob from "../models/govJobModel.js";

// @desc    Get all government jobs
// @route   GET /api/gov/jobs
// @access  Public
export const getGovJobs = async (req, res) => {
  try {
    const jobs = await GovJob.find({ status: "active" });
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get a single government job by ID
// @route   GET /api/gov/jobs/:id
// @access  Public
export const getGovJobById = async (req, res) => {
  try {
    const job = await GovJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create a new government job
// @route   POST /api/gov/jobs
// @access  Private (Admin)
export const createGovJob = async (req, res) => {
  try {
    const job = await GovJob.create(req.body);
    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid data",
      error: error.message,
    });
  }
};

// @desc    Update a government job
// @route   PUT /api/gov/jobs/:id
// @access  Private (Admin)
export const updateGovJob = async (req, res) => {
  try {
    const job = await GovJob.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid data",
      error: error.message,
    });
  }
};

// @desc    Delete a government job
// @route   DELETE /api/gov/jobs/:id
// @access  Private (Admin)
export const deleteGovJob = async (req, res) => {
  try {
    const job = await GovJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    await job.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
