const express = require('express');

const router = express.Router();
const User = require('../models/User');
const Certificate = require('../models/Certificate');

/**
 * @route   GET /api/public/approved-universities
 * @desc    Get list of approved universities for student registration
 * @access  Public
 */
router.get('/approved-universities', async (req, res) => {
  try {
    const universities = await User.find({ 
      role: 'university',
      'universityDetails.approved': true 
    }).select('universityDetails.universityName universityDetails.universityId');
    
    const universityList = universities.map(uni => ({
      name: uni.universityDetails.universityName,
      id: uni.universityDetails.universityId
    }));
    
    res.json({
      success: true,
      universities: universityList
    });
  } catch (error) {
    console.error('Get approved universities error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching universities'
    });
  }
});

/**
 * @route   GET /api/public/verify/:blockchainId
 * @desc    Verify certificate by blockchain ID
 * @access  Public
 */
router.get('/verify/:blockchainId', async (req, res) => {
  try {
    const { blockchainId } = req.params;
    
    if (!blockchainId) {
      return res.status(400).json({
        success: false,
        msg: 'Blockchain ID is required',
        valid: false
      });
    }
    
    console.log('Verifying blockchain ID:', blockchainId);
    
    // Find certificate by blockchainId and status must be 'issued'
    const certificate = await Certificate.findOne({ 
      blockchainId: blockchainId.trim(), 
      status: 'issued' 
    });
    
    if (!certificate) {
      console.log('Certificate not found for blockchain ID:', blockchainId);
      return res.status(404).json({
        success: false,
        msg: 'Blockchain ID does not exist or certificate has been revoked',
        valid: false
      });
    }
    
    console.log('Certificate found:', certificate.blockchainId);
    
    // Return certificate details for verification
    res.json({
      success: true,
      valid: true,
      certificate: {
        blockchainId: certificate.blockchainId,
        certificateType: certificate.certificateType,
        universityName: certificate.universityName,
        universityId: certificate.universityId,
        studentName: certificate.studentName,
        enrollmentNumber: certificate.enrollmentNumber || certificate.registerNo,
        registerNo: certificate.registerNo,
        program: certificate.program || certificate.course,
        course: certificate.course,
        yearOfGraduation: certificate.yearOfGraduation,
        semester: certificate.semester,
        dateOfIssue: certificate.dateOfIssue,
        ipfsHash: certificate.ipfsHash,
        blockchainTxHash: certificate.blockchainTxHash,
        pdfPath: certificate.pdfPath,
        status: certificate.status
      }
    });
    
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while verifying certificate',
      valid: false
    });
  }
});

/**
 * @route   GET /api/public/certificate/:blockchainId/download
 * @desc    Download certificate PDF by blockchain ID
 * @access  Public
 */
router.get('/certificate/:blockchainId/download', async (req, res) => {
  try {
    const { blockchainId } = req.params;
    
    const certificate = await Certificate.findOne({ 
      blockchainId: blockchainId.trim(), 
      status: 'issued' 
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        msg: 'Certificate not found'
      });
    }
    
    if (!certificate.pdfPath) {
      return res.status(404).json({
        success: false,
        msg: 'Certificate PDF not available'
      });
    }
    
    // Return the PDF path for frontend to handle
    res.json({
      success: true,
      pdfPath: certificate.pdfPath,
      downloadUrl: `/${certificate.pdfPath}`,
      ipfsUrl: certificate.ipfsHash ? `https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}` : null
    });
    
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while downloading certificate'
    });
  }
});

module.exports = router;