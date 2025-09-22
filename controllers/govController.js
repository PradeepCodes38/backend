import govJobModel from '../models/govJobModel.js';
import GovApplication from '../models/govApplicationModel.js';

// Get dashboard statistics
export const getStats = async (req, res) => {
  try {
    // Get total jobs count
    const totalJobs = await govJobModel.countDocuments();
    
    // Get active jobs count
    const activeJobs = await govJobModel.countDocuments({ status: 'active' });
    
    // Get total applications count
    const totalApplications = await GovApplication.countDocuments();
    
    // Get pending applications count
    const pendingApplications = await GovApplication.countDocuments({ status: 'pending' });
    
    // Get approved applications count
    const approvedApplications = await GovApplication.countDocuments({ status: 'approved' });
    
    // Get rejected applications count
    const rejectedApplications = await GovApplication.countDocuments({ status: 'rejected' });
    
    // Calculate total fees collected - SIMPLIFIED AND FIXED
    let totalFeesCollected = 0;
    
    try {
      // First, try with simple aggregation for numeric fees
      const feesResult = await GovApplication.aggregate([
        { 
          $match: { 
            paymentStatus: 'completed',
            fee: { $exists: true, $ne: null }
          } 
        },
        { 
          $addFields: {
            numericFee: {
              $cond: {
                if: { $type: "$fee" },
                then: {
                  $cond: {
                    if: { $eq: [{ $type: "$fee" }, "string"] },
                    then: {
                      $cond: {
                        if: { $regexMatch: { input: "$fee", regex: /^[₹\$]?[\d,]+\.?\d*$/ } },
                        then: { 
                          $toDouble: { 
                            $replaceAll: { 
                              input: { $replaceAll: { input: "$fee", find: "₹", replacement: "" } }, 
                              find: ",", 
                              replacement: "" 
                            } 
                          } 
                        },
                        else: 0
                      }
                    },
                    else: { $toDouble: "$fee" }
                  }
                },
                else: 0
              }
            }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: "$numericFee" }
          } 
        }
      ]);
      
      totalFeesCollected = feesResult.length > 0 ? feesResult[0].total : 0;
      
      // If aggregation fails or returns 0, try manual calculation as fallback
      if (totalFeesCollected === 0) {
        const applications = await GovApplication.find({ 
          paymentStatus: 'completed',
          fee: { $exists: true, $ne: null }
        });
        
        totalFeesCollected = applications.reduce((sum, app) => {
          let feeValue = 0;
          if (app.fee) {
            // Handle different fee formats
            if (typeof app.fee === 'number') {
              feeValue = app.fee;
            } else if (typeof app.fee === 'string') {
              // Remove currency symbols and commas, then convert to number
              const cleanFee = app.fee.toString().replace(/[₹$,]/g, '');
              feeValue = parseFloat(cleanFee) || 0;
            }
          }
          return sum + feeValue;
        }, 0);
      }
      
    } catch (aggregationError) {
      console.error('Aggregation failed, using fallback calculation:', aggregationError);
      
      // Fallback: Get all paid applications and calculate manually
      const applications = await GovApplication.find({ 
        paymentStatus: 'completed',
        fee: { $exists: true, $ne: null }
      });
      
      totalFeesCollected = applications.reduce((sum, app) => {
        let feeValue = 0;
        if (app.fee) {
          if (typeof app.fee === 'number') {
            feeValue = app.fee;
          } else if (typeof app.fee === 'string') {
            // Remove currency symbols and commas, then convert to number
            const cleanFee = app.fee.toString().replace(/[₹$,]/g, '');
            feeValue = parseFloat(cleanFee) || 0;
          }
        }
        return sum + feeValue;
      }, 0);
    }
    
    // Debug logging
    console.log('Revenue Calculation Debug:');
    console.log('Total fees collected:', totalFeesCollected);
    
    // Return statistics
    res.json({
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalFeesCollected: Math.round(totalFeesCollected * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

// Get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await govJobModel.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// Create a new job
export const createJob = async (req, res) => {
  try {
    // Ensure fee is stored as a number
    if (req.body.fee) {
      req.body.fee = parseFloat(req.body.fee.toString().replace(/[₹$,]/g, '')) || 0;
    }
    
    const newJob = new govJobModel(req.body);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
};

// Update a job
export const updateJob = async (req, res) => {
  try {
    // Ensure fee is stored as a number
    if (req.body.fee) {
      req.body.fee = parseFloat(req.body.fee.toString().replace(/[₹$,]/g, '')) || 0;
    }
    
    const updatedJob = await govJobModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
};

// Delete a job
export const deleteJob = async (req, res) => {
  try {
    const deletedJob = await govJobModel.findByIdAndDelete(req.params.id);
    
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
};

// Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const applications = await GovApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedApplication = await GovApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!updatedApplication) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Status updated successfully',
      application: updatedApplication 
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update application status' 
    });
  }
};

// Export applications to CSV
export const exportApplicationsToCSV = async (req, res) => {
  try {
    const applications = await GovApplication.find().sort({ createdAt: -1 });
    
    // Create CSV content
    let csv = 'Name,Email,Job Title,Applied Date,Status,Payment Status,Fee\n';
    
    applications.forEach(app => {
      csv += `"${app.name}","${app.email}","${app.jobTitle}","${app.appliedDate}","${app.status}","${app.paymentStatus}","${app.fee}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({ message: 'Failed to export applications' });
  }
};