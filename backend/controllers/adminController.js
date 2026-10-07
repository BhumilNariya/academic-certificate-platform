const User = require('../models/User');
const PendingRequest = require('../models/PendingRequest');
const Certificate = require('../models/Certificate');

// Generate university ID
const generateUniversityId = async () => {
  try {
    const count = await User.countDocuments({ 
      role: 'university',
      'universityDetails.approved': true 
    });
    
    const nextNumber = (count + 1).toString().padStart(2, '0');
    return `un${nextNumber}`;
  } catch (error) {
    console.error('Generate university ID error:', error);
    throw error;
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await PendingRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
};

const getApprovedUniversities = async (req, res) => {
  try {
    const universities = await User.find({ 
      role: 'university',
      'universityDetails.approved': true 
    }).select('-password');
    
    const universitiesWithStats = universities.map(university => ({
      ...university.toObject(),
      certificateCount: 0 // Since Certificate model might not have data yet
    }));
    
    res.json({ success: true, universities: universitiesWithStats });
  } catch (error) {
    console.error('Get approved universities error:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
};

const approveUniversity = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const pendingRequest = await PendingRequest.findById(requestId);
    if (!pendingRequest) {
      return res.status(404).json({ success: false, msg: 'Pending request not found' });
    }
    
    if (pendingRequest.status !== 'pending') {
      return res.status(400).json({ success: false, msg: 'Request has already been processed' });
    }
    
    const universityId = await generateUniversityId();
    
    // Create user in main User collection
    const userData = {
      email: pendingRequest.email,
      password: pendingRequest.password,
      role: 'university',
      universityDetails: {
        ...pendingRequest.universityDetails,
        approved: true,
        approvedBy: req.user.userId,
        approvalDate: new Date(),
        universityId: universityId
      }
    };
    
    const newUser = new User(userData);
    await newUser.save();
    
    // Update pending request status
    pendingRequest.status = 'approved';
    pendingRequest.reviewedBy = req.user.userId;
    pendingRequest.reviewDate = new Date();
    pendingRequest.universityId = universityId;
    await pendingRequest.save();
    
    res.json({
      success: true,
      msg: 'University approved successfully',
      universityId: universityId,
      university: {
        id: newUser._id,
        name: newUser.universityDetails.universityName,
        email: newUser.email,
        universityId: universityId
      }
    });
    
  } catch (error) {
    console.error('Approve university error:', error);
    res.status(500).json({ success: false, msg: 'Server error while approving university' });
  }
};

const rejectUniversity = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    
    const pendingRequest = await PendingRequest.findById(requestId);
    if (!pendingRequest) {
      return res.status(404).json({ success: false, msg: 'Pending request not found' });
    }
    
    if (pendingRequest.status !== 'pending') {
      return res.status(400).json({ success: false, msg: 'Request has already been processed' });
    }
    
    pendingRequest.status = 'rejected';
    pendingRequest.reviewedBy = req.user.userId;
    pendingRequest.reviewDate = new Date();
    pendingRequest.rejectionReason = reason || 'No reason provided';
    await pendingRequest.save();
    
    res.json({
      success: true,
      msg: 'University request rejected',
      reason: reason || 'No reason provided'
    });
    
  } catch (error) {
    console.error('Reject university error:', error);
    res.status(500).json({ success: false, msg: 'Server error while rejecting university' });
  }
};

const removeUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    
    const university = await User.findById(universityId);
    if (!university || university.role !== 'university') {
      return res.status(404).json({ success: false, msg: 'University not found' });
    }
    
    await User.findByIdAndDelete(universityId);
    
    res.json({ success: true, msg: 'University removed successfully' });
    
  } catch (error) {
    console.error('Remove university error:', error);
    res.status(500).json({ success: false, msg: 'Server error while removing university' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [totalUniversities, totalStudents, pendingRequests] = await Promise.all([
      User.countDocuments({ role: 'university', 'universityDetails.approved': true }),
      User.countDocuments({ role: 'student' }),
      PendingRequest.countDocuments({ status: 'pending' })
    ]);
    
    res.json({
      success: true,
      stats: {
        totalUniversities,
        totalStudents,
        totalCertificates: 0,
        pendingRequests
      }
    });
    
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, msg: 'Server error while fetching dashboard stats' });
  }
};

module.exports = {
  getPendingRequests,
  getApprovedUniversities,
  approveUniversity,
  rejectUniversity,
  removeUniversity,
  getDashboardStats
};