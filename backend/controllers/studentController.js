const User = require('../models/User');
const Certificate = require('../models/Certificate');

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.userId).select('-password');
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ 
        success: false,
        msg: 'Student not found' 
      });
    }

    res.json({
      success: true,
      data: {
        id: student._id,
        email: student.email,
        role: student.role,
        studentDetails: student.studentDetails,
        createdAt: student.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while fetching profile' 
    });
  }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const { studentDetails } = req.body;
    
    const student = await User.findById(req.user.userId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ 
        success: false,
        msg: 'Student not found' 
      });
    }

    // Update student details
    if (studentDetails) {
      student.studentDetails = {
        ...student.studentDetails.toObject(),
        ...studentDetails
      };
    }

    await student.save();

    res.json({
      success: true,
      msg: 'Profile updated successfully',
      data: {
        id: student._id,
        email: student.email,
        role: student.role,
        studentDetails: student.studentDetails
      }
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while updating profile' 
    });
  }
};

// Get student certificates
const getStudentCertificates = async (req, res) => {
  try {
    const student = await User.findById(req.user.userId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ 
        success: false,
        msg: 'Student not found' 
      });
    }

    // Find certificates issued to this student's email
    const certificates = await Certificate.find({ 
      studentEmail: student.email,
      status: 'issued'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: certificates,
      count: certificates.length
    });
  } catch (error) {
    console.error('Error fetching student certificates:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while fetching certificates' 
    });
  }
};

// Get single certificate details
const getCertificateDetails = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const student = await User.findById(req.user.userId);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ 
        success: false,
        msg: 'Student not found' 
      });
    }

    const certificate = await Certificate.findOne({
      _id: certificateId,
      studentEmail: student.email
    });

    if (!certificate) {
      return res.status(404).json({ 
        success: false,
        msg: 'Certificate not found or not authorized' 
      });
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Error fetching certificate details:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while fetching certificate' 
    });
  }
};

// Download certificate PDF
// Download certificate PDF
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const student = await User.findById(req.user.userId);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({ 
        success: false,
        msg: 'Student not found' 
      });
    }

    const certificate = await Certificate.findOne({
      _id: certificateId,
      studentEmail: student.email,
      status: 'issued'
    });

    if (!certificate) {
      return res.status(404).json({ 
        success: false,
        msg: 'Certificate not found or not authorized' 
      });
    }

    // ✅ FIXED: Return correct download URL
    res.json({
      success: true,
      data: {
        certificateId: certificate._id,
        blockchainId: certificate.blockchainId,
        ipfsHash: certificate.ipfsHash,
        // ✅ Fixed: Remove extra path prefix
        downloadUrl: `/${certificate.pdfPath}`, // Direct path to file
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`,
        fileName: `${certificate.certificateType}_${certificate.blockchainId}.pdf`
      }
    });

  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while downloading certificate' 
    });
  }
};
module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudentCertificates,
  getCertificateDetails,
  downloadCertificate
};