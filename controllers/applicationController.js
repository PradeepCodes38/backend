import Application from '../models/Application.js';
import Job from '../models/Job.js';

// Submit job application
export const submitApplication = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const applicationData = {
      ...req.body,
      resumeFileName: req.file.filename,
      resumeOriginalName: req.file.originalname,
      resumeUrl: `/uploads/resumes/${req.file.filename}`
    };

    const application = new Application(applicationData);
    await application.save();

    // Increment application count for the job
    await Job.findByIdAndUpdate(req.body.jobId, { $inc: { applicationCount: 1 } });

    res.status(201).json({ 
      message: 'Application submitted successfully',
      application: application
    });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting application', error: error.message });
  }
};

// Get applications for a specific job
export const getJobApplications = async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('jobId', 'title company')
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId', 'title company')
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('jobId', 'title company');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: 'Error updating application', error: error.message });
  }
};