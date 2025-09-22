import Job from '../models/Job.js';
import Application from '../models/Application.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    
    // Recent applications (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentApplications = await Application.countDocuments({
      appliedDate: { $gte: weekAgo }
    });

    // Top performing jobs
    const topJobs = await Job.find({ isActive: true })
      .sort({ applicationCount: -1 })
      .limit(5)
      .select('title company applicationCount');

    res.json({
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        recentApplications
      },
      topJobs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};