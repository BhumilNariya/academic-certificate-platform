const fs = require('fs');
const path = require('path');
const Certificate = require('../models/Certificate');
const Template = require('../models/Template');
const User = require('../models/User');
const { renderTemplateToPdf } = require('../utils/pdfGenerator');
const { uploadFileToPinata } = require('../utils/pinata');
const { generateQRCodeDataURI } = require('../utils/qr');
const { ethers } = require('ethers');
const contractABI = require('../abi/CertificateRegistry.json');

// Generate unique blockchain ID
function generateBlockchainId(universityId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${universityId}-CERT-${random}-${date}`;
}

// Get university profile
async function getUniversityProfile(req, res) {
  try {
    if (req.user.role !== 'university') {
      return res.status(403).json({ msg: 'Forbidden: Only universities can access this' });
    }

    const university = await User.findById(req.user.userId).select('-password');
    
    if (!university) {
      return res.status(404).json({ msg: 'University not found' });
    }

    // Transform the response to match frontend expectations
    const transformedUniversity = {
      ...university.toObject(),
      universityDetails: university.universityDetails ? {
        universityName: university.universityDetails.universityName,
        universityId: university.universityDetails.universityId,
        address: university.universityDetails.officialAddress, // Map officialAddress to address
        phone: university.universityDetails.contactNumber, // Map contactNumber to phone
        registrationNumber: university.universityDetails.accreditationId, // Map accreditationId to registrationNumber
        city: university.universityDetails.city,
        state: university.universityDetails.state,
        country: university.universityDetails.country,
        contactPersonName: university.universityDetails.contactPersonName,
        coursesOffered: university.universityDetails.coursesOffered,
        approved: university.universityDetails.approved,
        approvedBy: university.universityDetails.approvedBy,
        approvalDate: university.universityDetails.approvalDate
      } : null
    };

    res.json({ 
      success: true,
      university 
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

// Upload template
async function uploadTemplate(req, res) {
  try {
    if (req.user.role !== 'university') {
      return res.status(403).json({ msg: 'Forbidden: Only universities can upload templates' });
    }

    const { templateName, certificateType } = req.body;
    const universityId = req.user.userId;

    if (!templateName || !certificateType || !req.file) {
      return res.status(400).json({ msg: 'Missing required fields or template file' });
    }

    // Get university details
    const university = await User.findById(universityId);
    if (!university || !university.universityDetails) {
      return res.status(404).json({ msg: 'University details not found' });
    }

    const univId = university.universityDetails.universityId; // e.g., "UN01"

    // Create university template directory if not exists
    const templateDir = path.join(__dirname, '..', 'templates', univId);
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }

    // Determine file extension and convert if needed
    const uploadedFile = req.file;
    const fileExt = path.extname(uploadedFile.originalname).toLowerCase();
    
    let ejsFileName;
    let finalTemplatePath;

    if (fileExt === '.ejs') {
      // Direct EJS upload
      ejsFileName = `${certificateType}.ejs`;
      finalTemplatePath = path.join(templateDir, ejsFileName);
      fs.copyFileSync(uploadedFile.path, finalTemplatePath);
    } else if (fileExt === '.html' || fileExt === '.htm') {
      // Convert HTML to EJS (just rename, EJS supports HTML)
      ejsFileName = `${certificateType}.ejs`;
      finalTemplatePath = path.join(templateDir, ejsFileName);
      fs.copyFileSync(uploadedFile.path, finalTemplatePath);
    } else if (fileExt === '.pdf') {
      // For PDF, we'll need to reject or handle separately
      return res.status(400).json({ msg: 'PDF templates need to be converted to HTML/EJS first' });
    } else {
      return res.status(400).json({ msg: 'Invalid file format. Upload .ejs or .html file' });
    }

    // Clean up uploaded file
    fs.unlinkSync(uploadedFile.path);

    // Save template to database
    const template = new Template({
      templateName,
      certificateType,
      university: universityId,
      universityId: univId,
      templatePath: `templates/${univId}/${ejsFileName}`,
      placeholders: [], // Can be populated later if needed
      isActive: true
    });

    await template.save();

    res.json({ 
      msg: 'Template uploaded successfully', 
      template: {
        id: template._id,
        templateName: template.templateName,
        certificateType: template.certificateType
      }
    });
  } catch (err) {
    console.error('Upload template error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

// Get all templates for a university
async function getTemplates(req, res) {
  try {
    if (req.user.role !== 'university') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const templates = await Template.find({ 
      university: req.user.userId,
      isActive: true 
    });

    res.json({ templates });
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

// Issue single certificate
async function issueCertificate(req, res) {
  try {
    if (req.user.role !== 'university') {
      return res.status(403).json({ msg: 'Forbidden: Only universities can issue certificates' });
    }

    const universityId = req.user.userId;
    const { templateId, certificateData, studentEmail } = req.body;

    if (!templateId || !certificateData || !studentEmail) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Get university details
    const university = await User.findById(universityId);
    if (!university || !university.universityDetails) {
      return res.status(404).json({ msg: 'University not found' });
    }

    // Get template
    const template = await Template.findById(templateId);
    if (!template || template.university.toString() !== universityId) {
      return res.status(404).json({ msg: 'Template not found or unauthorized' });
    }

    // Generate blockchain ID
    const blockchainId = generateBlockchainId(university.universityDetails.universityId);

    // Generate QR code with blockchain ID
    const qrDataUri = await generateQRCodeDataURI(blockchainId);

    // Prepare data for EJS template
    const ejsData = {
      ...certificateData,
      universityName: university.universityDetails.universityName,
      blockchainId,
      qrCodeData: qrDataUri,
      issueDate: new Date().toISOString().slice(0, 10)
    };

    // Generate PDF
    const templatePath = path.join(__dirname, '..', template.templatePath);
    const pdfFileName = `${blockchainId}.pdf`;
    const pdfPath = path.join(__dirname, '..', 'uploads', 'certificates', pdfFileName);

    // Create certificates directory if not exists
    const certDir = path.dirname(pdfPath);
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    await renderTemplateToPdf(templatePath, ejsData, pdfPath);

    // Upload to IPFS
    const pinResult = await uploadFileToPinata(pdfPath);

    // Save certificate to database
    // In issueCertificate function, update this section:
const certificate = new Certificate({
  blockchainId,
  certificateType: template.certificateType,
  universityId: university.universityDetails.universityId,
  universityName: university.universityDetails.universityName,
  issuedBy: universityId,
  studentEmail,
  studentName: certificateData.studentName,
  enrollmentNumber: certificateData.enrollmentNumber || certificateData.registerNo,
  registerNo: certificateData.registerNo,
  course: certificateData.course, // ✅ Make sure this is saved
  program: certificateData.program || certificateData.course, // ✅ Add this
  semester: certificateData.semester,
  yearOfGraduation: certificateData.yearOfGraduation, // ✅ Make sure this is saved
  ipfsHash: pinResult.IpfsHash,
  pdfPath: `uploads/certificates/${pdfFileName}`,
  qrCodeData: qrDataUri,
  templateUsed: templateId,
  certificateData: ejsData,
  status: 'issued',
  verifiedOnChain: false
});

    // Mint on blockchain if configured
    if (process.env.RPC_URL && process.env.ETH_PRIVATE_KEY && process.env.CONTRACT_ADDRESS) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI.abi, wallet);

        const tx = await contract.issueCertificate(blockchainId, pinResult.IpfsHash);
        const receipt = await tx.wait();

        certificate.blockchainTxHash = receipt.hash || tx.hash;
        certificate.blockNumber = receipt.blockNumber;
        certificate.verifiedOnChain = true;
      } catch (err) {
        console.error('Blockchain minting error:', err);
      }
    }

    await certificate.save();

    // Link certificate to student if they exist
    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (student) {
      if (!student.issuedCertificates) {
        student.issuedCertificates = [];
      }
      student.issuedCertificates.push(certificate._id);
      await student.save();
    }

    res.json({ 
      msg: 'Certificate issued successfully', 
      certificate: {
        blockchainId: certificate.blockchainId,
        ipfsHash: certificate.ipfsHash,
        pdfPath: certificate.pdfPath
      }
    });
  } catch (err) {
    console.error('Issue certificate error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

// Get all issued certificates for university
async function getIssuedCertificates(req, res) {
  try {
    if (req.user.role !== 'university') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const { search, certificateType, course, startDate, endDate } = req.query;
    const universityId = req.user.userId;

    // Build query
    let query = { issuedBy: universityId };

    if (search) {
      query.$or = [
        { blockchainId: { $regex: search, $options: 'i' } },
        { registerNo: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } }
      ];
    }

    if (certificateType) {
      query.certificateType = certificateType;
    }

    if (course) {
      query.course = { $regex: course, $options: 'i' };
    }

    if (startDate || endDate) {
      query.dateOfIssue = {};
      if (startDate) query.dateOfIssue.$gte = new Date(startDate);
      if (endDate) query.dateOfIssue.$lte = new Date(endDate);
    }

    const certificates = await Certificate.find(query)
      .populate('templateUsed', 'templateName certificateType')
      .sort({ dateOfIssue: -1 });

    res.json({ certificates });
  } catch (err) {
    console.error('Get certificates error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

// Revoke certificate
async function revokeCertificate(req, res) {
  try {
    if (req.user.role !== 'university') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const { certificateId } = req.params;
    const universityId = req.user.userId;

    const certificate = await Certificate.findOne({ 
      _id: certificateId,
      issuedBy: universityId 
    });

    if (!certificate) {
      return res.status(404).json({ msg: 'Certificate not found or unauthorized' });
    }

    certificate.status = 'revoked';
    await certificate.save();

    // Delete PDF file
    const pdfPath = path.join(__dirname, '..', certificate.pdfPath);
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    res.json({ msg: 'Certificate revoked successfully' });
  } catch (err) {
    console.error('Revoke certificate error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

// Preview certificate (HTML only, no save)
async function previewCertificate(req, res) {
  try {
    if (req.user.role !== 'university') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const { templateId, certificateData } = req.body;

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }

    const university = await User.findById(req.user.userId);
    
    // Generate temporary QR
    const tempId = `PREVIEW-${Date.now()}`;
    const qrDataUri = await generateQRCodeDataURI(tempId);

    const ejsData = {
      ...certificateData,
      universityName: university.universityDetails.universityName,
      blockchainId: tempId,
      qrCodeData: qrDataUri,
      issueDate: new Date().toISOString().slice(0, 10)
    };

    const templatePath = path.join(__dirname, '..', template.templatePath);
    const ejs = require('ejs');
    const html = await ejs.renderFile(templatePath, ejsData);

    res.send(html);
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
}

// Export all functions including getUniversityProfile
module.exports = { 
  getUniversityProfile,
  uploadTemplate,
  getTemplates,
  issueCertificate,
  getIssuedCertificates,
  revokeCertificate,
  previewCertificate
};