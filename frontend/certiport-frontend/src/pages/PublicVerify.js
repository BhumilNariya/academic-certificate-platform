import React, { useState } from 'react';
import logo from '../assets/main.png' 
import { Shield, CheckCircle, XCircle, Download, Eye, Upload, Search, FileText, Calendar, User, Building2, Award } from 'lucide-react';
import '../styles/PublicVerification.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function PublicVerify() {
  const [blockchainId, setBlockchainId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!blockchainId.trim()) {
      setError('Please enter a blockchain ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/public/verify/${blockchainId.trim()}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setResult(data);
        setError('');
      } else {
        setError(data.msg || 'Certificate not found or invalid');
        setResult(null);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Blockchain ID does not exist or verification failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = () => {
    if (result?.certificate?.pdfPath) {
      const pdfUrl = `http://localhost:5000/${result.certificate.pdfPath}`;
      window.open(pdfUrl, '_blank');
    } else if (result?.certificate?.ipfsHash) {
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.certificate.ipfsHash}`;
      window.open(ipfsUrl, '_blank');
    } else {
      alert('Certificate file not available');
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      if (result?.certificate?.pdfPath) {
        const pdfUrl = `http://localhost:5000/${result.certificate.pdfPath}`;
        
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate_${result.certificate.blockchainId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Certificate file not available for download');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download certificate. Please try viewing it instead.');
    }
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, prompt user to enter manually
      // You can integrate jsQR library for actual QR scanning
      alert('Please scan the QR code with your device camera or enter the Blockchain ID manually');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCertificateTypeDisplay = (type) => {
    const types = {
      'marks_card': 'Marks Card',
      'transfer': 'Transfer Certificate',
      'migration': 'Migration Certificate',
      'grade_card': 'Grade Card',
      'degree': 'Degree Certificate',
      'diploma': 'Diploma Certificate'
    };
    return types[type] || type;
  };

  return (
    <div className="verify-container">
      {/* Hero Section */}
      <div className="verify-hero">
        <div className="verify-hero-content">
          <img src={logo} alt="CertiPort" className='lo'/>
          <h1 className="verify-title">Certificate Verification</h1>
          <p className="verify-subtitle">
            Instantly verify the authenticity of academic certificates using blockchain technology
          </p>
        </div>
      </div>

      <div className="verify-content">
        {/* Verification Form Card */}
        <div className="verify-card">
          <div className="verify-header">
            <div className="verify-logo-section">
              <img src="/logo.png" alt="CertiPort" className="verify-logo" onError={(e) => e.target.style.display = 'none'} />
              <div>
                <h2>Verify Certificate</h2>
                <p>Enter the blockchain ID to verify authenticity</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerify} className="verify-form">
            <div className="input-group">
              <div className="input-wrapper">
                <Search className="input-icon" />
                <input
                  type="text"
                  value={blockchainId}
                  onChange={(e) => setBlockchainId(e.target.value)}
                  placeholder="Enter Blockchain ID (e.g., UN01-CERT-ABC123-20250128)"
                  className="verify-input"
                  disabled={loading}
                />
              </div>
              
             
            </div>

            <button type="submit" className="verify-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="btn-icon" />
                  Verify Certificate
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <XCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Result */}
          {result && result.valid && (
            <div className="result-card">
              <div className="result-header">
                <div className="success-icon">
                  <CheckCircle className="check-icon" />
                </div>
                <h3>Certificate Verified ✓</h3>
                <p>This certificate is authentic and verified on the blockchain</p>
              </div>

              <div className="certificate-details">
                <div className="detail-section">
                  <h4 className="section-title">
                    <User className="section-icon" />
                    Student Information
                  </h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Student Name</label>
                      <span>{result.certificate.studentName || 'N/A'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Enrollment Number</label>
                      <span>{result.certificate.enrollmentNumber || result.certificate.registerNo || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">
                    <Building2 className="section-icon" />
                    University Information
                  </h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>University Name</label>
                      <span>{result.certificate.universityName || 'N/A'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>University ID</label>
                      <span>{result.certificate.universityId || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="section-title">
                    <Award className="section-icon" />
                    Certificate Information
                  </h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Certificate Type</label>
                      <span>{getCertificateTypeDisplay(result.certificate.certificateType)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <label>Blockchain ID</label>
                      <span className="cert-id">{result.certificate.blockchainId}</span>
                    </div>
                    
                    {result.certificate.program && (
                      <div className="detail-item">
                        <label>Program/Course</label>
                        <span>{result.certificate.program}</span>
                      </div>
                    )}
                    
                    {result.certificate.yearOfGraduation && (
                      <div className="detail-item">
                        <label>Year of Graduation</label>
                        <span>{result.certificate.yearOfGraduation}</span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <label>Issue Date</label>
                      <span>{formatDate(result.certificate.dateOfIssue)}</span>
                    </div>
                  </div>
                </div>

                {/* Blockchain Information */}
                <div className="blockchain-info">
                  <div className="blockchain-badge">
                    <Shield className="badge-icon" />
                    Blockchain Verified
                  </div>
                  {result.certificate.ipfsHash && (
                    <div className="ipfs-info">
                      <label>IPFS Hash:</label>
                      <span className="hash-text">{result.certificate.ipfsHash.slice(0, 10)}...{result.certificate.ipfsHash.slice(-8)}</span>
                    </div>
                  )}
                  {result.certificate.blockchainTxHash && (
                    <div className="tx-info">
                      <label>Transaction Hash:</label>
                      <span className="tx-hash">{result.certificate.blockchainTxHash.slice(0, 10)}...{result.certificate.blockchainTxHash.slice(-8)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="certificate-actions">
                  <button className="action-btn view-btn" onClick={handleViewCertificate}>
                    <Eye className="btn-icon" />
                    View Certificate
                  </button>
                  
                  <button className="action-btn download-btn" onClick={handleDownloadCertificate}>
                    <Download className="btn-icon" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information Sidebar */}
        <div className="verify-info">
          <div className="info-card">
            <h3>How it works</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Enter Blockchain ID</h4>
                  <p>Input the unique blockchain ID from your certificate</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Blockchain Verification</h4>
                  <p>System verifies the certificate against blockchain records</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>View & Download</h4>
                  <p>Access verified certificate details and download PDF</p>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="security-features">
            <h3>Security Features</h3>
            <div className="features">
              <div className="feature">
                <CheckCircle className="feature-icon" />
                <span>Blockchain Secured</span>
              </div>
              <div className="feature">
                <Shield className="feature-icon" />
                <span>Tamper Proof</span>
              </div>
              <div className="feature">
                <FileText className="feature-icon" />
                <span>Instant Verification</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}