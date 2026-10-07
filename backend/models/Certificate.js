
const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  blockchainId: { type: String, required: true, unique: true }, // UN01-CERT-123456-20250101
  certificateType: { 
    type: String, 
    enum: ['marks_card', 'transfer', 'migration', 'grade_card'],
    required: true 
  },
  
  // University details
  universityId: { type: String, required: true },
  universityName: { type: String, required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Student details
  studentEmail: { type: String, required: true },
  studentName: { type: String, required: true },
  enrollmentNumber: { type: String },
  registerNo: { type: String },
  
  // Certificate details
  course: { type: String },
  program: { type: String },
  semester: { type: String },
  yearOfGraduation: { type: Number },
  dateOfIssue: { type: Date, default: Date.now },
  
  // File paths
  ipfsHash: { type: String, required: true },
  pdfPath: { type: String, required: true },
  qrCodeData: { type: String }, // QR data URI
  
  // Template reference
  templateUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  
  // Blockchain details
  blockchainTxHash: { type: String },
  blockNumber: { type: Number },
  verifiedOnChain: { type: Boolean, default: false },
  
  // Dynamic certificate data (stores all form fields)
  certificateData: { type: mongoose.Schema.Types.Mixed },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'issued', 'revoked'], 
    default: 'issued' 
  },
  
  // Email tracking
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date
  
}, { timestamps: true });

// ✅ Pre-save validation to ensure blockchainId is never null
CertificateSchema.pre('save', function(next) {
  if (!this.blockchainId) {
    return next(new Error('Blockchain ID is required and cannot be null'));
  }
  next();
});

// ✅ Indexes for faster queries (make blockchainId explicitly unique)
CertificateSchema.index({ blockchainId: 1 }, { unique: true });
CertificateSchema.index({ studentEmail: 1 });
CertificateSchema.index({ universityId: 1 });
CertificateSchema.index({ registerNo: 1 });
CertificateSchema.index({ enrollmentNumber: 1 });
CertificateSchema.index({ certificateType: 1 });
CertificateSchema.index({ dateOfIssue: 1 });
CertificateSchema.index({ status: 1 });

// ✅ Virtual for full blockchain verification URL
CertificateSchema.virtual('verificationUrl').get(function() {
  return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${this.blockchainId}`;
});

// ✅ Method to check if certificate is valid
CertificateSchema.methods.isValid = function() {
  return this.status === 'issued' && !this.isRevoked();
};

// ✅ Method to check if certificate is revoked
CertificateSchema.methods.isRevoked = function() {
  return this.status === 'revoked';
};

// ✅ Static method to find by blockchain ID
CertificateSchema.statics.findByBlockchainId = function(blockchainId) {
  return this.findOne({ blockchainId });
};

// ✅ Static method to get certificates by student email
CertificateSchema.statics.findByStudentEmail = function(email) {
  return this.find({ studentEmail: email, status: 'issued' }).sort({ dateOfIssue: -1 });
};

module.exports = mongoose.model('Certificate', CertificateSchema);
