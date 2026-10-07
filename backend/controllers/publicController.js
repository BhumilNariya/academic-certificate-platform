const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Certificate = require('../models/Certificate');

// Get approved universities for student registration
async function getApprovedUniversities(req, res) {
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
}

// Verify certificate by blockchain ID (public endpoint)
async function verifyCertificate(req, res) {
  try {
    const { blockchainId } = req.params;
    
    if (!blockchainId) {
      return res.status(400).json({
        success: false,
        msg: 'Blockchain ID is required',
        valid: false
      });
    }
    
    // Find certificate using the static method
    const certificate = await Certificate.findByBlockchainId(blockchainId);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        msg: 'Blockchain ID does not exist in our records',
        valid: false
      });
    }

    // Check if certificate is revoked
    if (certificate.status === 'revoked') {
      return res.status(403).json({
        success: false,
        msg: 'This certificate has been revoked and is no longer valid',
        valid: false
      });
    }

    // Check if certificate is still pending
    if (certificate.status === 'pending') {
      return res.status(400).json({
        success: false,
        msg: 'This certificate is still pending approval',
        valid: false
      });
    }
    
    // Return certificate details for verification (only if issued)
    res.json({
      success: true,
      valid: true,
      certificate: {
        certificateId: certificate.blockchainId, // For frontend compatibility
        blockchainId: certificate.blockchainId,
        certificateType: certificate.certificateType,
        university: {
          name: certificate.universityName // For frontend compatibility
        },
        universityName: certificate.universityName,
        universityId: certificate.universityId,
        studentName: certificate.studentName,
        enrollmentNumber: certificate.enrollmentNumber,
        registerNo: certificate.registerNo,
        course: certificate.course,
        program: certificate.program,
        semester: certificate.semester,
        yearOfGraduation: certificate.yearOfGraduation,
        issueDate: certificate.dateOfIssue, // For frontend compatibility
        dateOfIssue: certificate.dateOfIssue,
        ipfsHash: certificate.ipfsHash,
        blockchainTx: certificate.blockchainTxHash, // For frontend compatibility
        blockchainTxHash: certificate.blockchainTxHash,
        verifiedOnChain: certificate.verifiedOnChain,
        pdfPath: certificate.pdfPath,
        metadata: {
          rollNo: certificate.registerNo,
          collegeName: certificate.universityName,
          enrollmentNumber: certificate.enrollmentNumber
        }
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
}

// Download certificate PDF
async function downloadCertificate(req, res) {
  try {
    const { blockchainId } = req.params;
    
    if (!blockchainId) {
      return res.status(400).json({
        success: false,
        msg: 'Blockchain ID is required'
      });
    }
    
    // Find certificate
    const certificate = await Certificate.findByBlockchainId(blockchainId);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        msg: 'Certificate not found'
      });
    }

    // Check if certificate is valid (issued and not revoked)
    if (!certificate.isValid()) {
      return res.status(403).json({
        success: false,
        msg: 'Certificate is not valid or has been revoked'
      });
    }
    
    // Get PDF file path
    const pdfPath = path.join(__dirname, '..', certificate.pdfPath);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.error('PDF file not found:', pdfPath);
      return res.status(404).json({
        success: false,
        msg: 'Certificate file not found on server'
      });
    }
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.blockchainId}.pdf"`);
    
    // Send file
    res.sendFile(pdfPath);
    
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while downloading certificate'
    });
  }
}

// View certificate PDF (inline in browser)
async function viewCertificate(req, res) {
  try {
    const { blockchainId } = req.params;
    
    if (!blockchainId) {
      return res.status(400).json({
        success: false,
        msg: 'Blockchain ID is required'
      });
    }
    
    // Find certificate
    const certificate = await Certificate.findByBlockchainId(blockchainId);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        msg: 'Certificate not found'
      });
    }

    // Check if certificate is valid
    if (!certificate.isValid()) {
      return res.status(403).json({
        success: false,
        msg: 'Certificate is not valid or has been revoked'
      });
    }
    
    // Get PDF file path
    const pdfPath = path.join(__dirname, '..', certificate.pdfPath);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.error('PDF file not found:', pdfPath);
      return res.status(404).json({
        success: false,
        msg: 'Certificate file not found on server'
      });
    }
    
    // Set headers for PDF view (inline)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${certificate.blockchainId}.pdf"`);
    
    // Send file
    res.sendFile(pdfPath);
    
  } catch (error) {
    console.error('View certificate error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while viewing certificate'
    });
  }
}

module.exports = {
  getApprovedUniversities,
  verifyCertificate,
  downloadCertificate,
  viewCertificate
};