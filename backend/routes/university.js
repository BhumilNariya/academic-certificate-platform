


const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { 
  getUniversityProfile,
  uploadTemplate,
  getTemplates,
  issueCertificate,
  getIssuedCertificates,
  revokeCertificate,
  previewCertificate
} = require('../controllers/universityController');

// Multer storage for template uploads
const templateStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/temp/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const templateUpload = multer({ 
  storage: templateStorage,
  fileFilter: function(req, file, cb) {
    const allowedTypes = ['.ejs', '.html', '.htm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .ejs and .html files are allowed'));
    }
  }
});

// Routes
router.get('/profile', auth, getUniversityProfile);
router.post('/template/upload', auth, templateUpload.single('templateFile'), uploadTemplate);
router.get('/templates', auth, getTemplates);
router.post('/certificate/issue', auth, issueCertificate);
router.post('/certificate/preview', auth, previewCertificate);
router.get('/certificates', auth, getIssuedCertificates);
router.delete('/certificate/:certificateId', auth, revokeCertificate);

module.exports = router;