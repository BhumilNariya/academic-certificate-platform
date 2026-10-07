import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Download, Eye, User, GraduationCap, Calendar, School, Mail, FileText, Shield, ExternalLink } from 'lucide-react';
import { studentService } from '../services/studentService';
import { auth } from '../utils/auth';
import '../styles/StudentDashboard.css';


const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated() || !auth.hasRole('student')) {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load user profile and certificates concurrently
      const [profileResponse, certificatesResponse] = await Promise.all([
        studentService.getProfile(),
        studentService.getCertificates()
      ]);

      if (profileResponse.success) {
        setUser(profileResponse.data);
      }

      if (certificatesResponse.success) {
        setCertificates(certificatesResponse.data);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      // If unauthorized, redirect to login
      if (err.message.includes('unauthorized') || err.message.includes('token')) {
        auth.logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const handleViewCertificate = async (certificate) => {
    try {
      const response = await studentService.getCertificateDetails(certificate._id);
      if (response.success) {
        setSelectedCertificate(response.data);
      }
    } catch (err) {
      console.error('Error viewing certificate:', err);
      setError('Failed to load certificate details');
    }
  };

  const handleDownloadCertificate = async (certificate) => {
  try {
    setError('');
    console.log('Downloading certificate:', certificate.blockchainId);
    
    const response = await studentService.downloadCertificate(certificate._id);
    
    if (response.success && response.data) {
      // Try direct download URL first
      if (response.data.downloadUrl) {
        const downloadUrl = `http://localhost:5000${response.data.downloadUrl}`;
        console.log('Opening:', downloadUrl);
        window.open(downloadUrl, '_blank');
      } 
      // Fallback to IPFS
      else if (response.data.ipfsUrl) {
        console.log('Opening IPFS:', response.data.ipfsUrl);
        window.open(response.data.ipfsUrl, '_blank');
      }
      // Last resort - try direct path
      else if (certificate.pdfPath) {
        const directUrl = `http://localhost:5000/${certificate.pdfPath}`;
        console.log('Opening direct:', directUrl);
        window.open(directUrl, '_blank');
      }
      else {
        throw new Error('No download URL available');
      }
    }
  } catch (err) {
    console.error('Error downloading certificate:', err);
    setError('Failed to download certificate. Please try again.');
  }
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCertificateTypeDisplay = (type) => {
    const types = {
      'degree': 'Degree Certificate',
      'diploma': 'Diploma Certificate',
      'marks_card': 'Marks Card',
      'transfer': 'Transfer Certificate',
      'migration': 'Migration Certificate',
      'consolidated_marks': 'Consolidated Marks Card'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-container">
        {/* Error Message */}
        {error && (
          <div className="error-alert">
            <div className="error-content">
              <span className="error-label">Error: </span>
              <span className="error-message">{error}</span>
              <button 
                onClick={() => setError('')}
                className="error-close"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <div className="user-avatar">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="avatar-image" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }} 
                />
                <User className="avatar-icon" />
              </div>
              <div className="user-details">
                <h1 className="user-name">
                  Welcome, {user?.studentDetails?.fullName || 'Student'}
                </h1>
                <p className="user-email">{user?.email}</p>
                <div className="verified-badge">
                  <Shield className="verified-icon" />
                  <span className="verified-text">Verified Student</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="profile-btn"
              >
                <User className="btn-icon" />
                {showProfile ? 'Hide Profile' : 'View Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        {showProfile && user && (
          <div className="profile-section">
            <h2 className="section-title">
              <User className="section-icon" />
              Student Profile
            </h2>
            
            <div className="profile-grid">
              {/* Personal Information */}
              <div className="profile-card">
                <h3 className="card-title">Personal Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <User className="info-icon" />
                    <span className="info-label">Name:</span>
                    <span className="info-value">{user.studentDetails?.fullName}</span>
                  </div>
                  <div className="info-item">
                    <Mail className="info-icon" />
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  {user.studentDetails?.dateOfBirth && (
                    <div className="info-item">
                      <Calendar className="info-icon" />
                      <span className="info-label">Date of Birth:</span>
                      <span className="info-value">{formatDate(user.studentDetails.dateOfBirth)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div className="profile-card">
                <h3 className="card-title">Academic Information</h3>
                
                {/* UG Details */}
                {user.studentDetails?.enrollmentNumber && (
                  <div className="academic-card ug-card">
                    <h4 className="academic-title">
                      <GraduationCap className="academic-icon" />
                      Undergraduate Details
                    </h4>
                    <div className="academic-details">
                      <div className="detail-row">
                        <span className="detail-label">Enrollment:</span>
                        <span className="detail-value">{user.studentDetails.enrollmentNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">University:</span>
                        <span className="detail-value">{user.studentDetails.universityName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{user.studentDetails.yearOfAdmission} - {user.studentDetails.yearOfGraduation}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PG Details */}
                {user.studentDetails?.program === 'pg' && user.studentDetails?.pgEnrollmentNumber && (
                  <div className="academic-card pg-card">
                    <h4 className="academic-title">
                      <School className="academic-icon" />
                      Postgraduate Details
                    </h4>
                    <div className="academic-details">
                      <div className="detail-row">
                        <span className="detail-label">Enrollment:</span>
                        <span className="detail-value">{user.studentDetails.pgEnrollmentNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">University:</span>
                        <span className="detail-value">{user.studentDetails.pgUniversityName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{user.studentDetails.pgYearOfAdmission} - {user.studentDetails.pgYearOfGraduation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificates Section */}
        <div className="certificates-section">
          <div className="certificates-header">
            <h2 className="section-title">
              <FileText className="section-icon" />
              Your Certificates ({certificates.length})
            </h2>
            <button className="refresh-btn1" onClick={loadDashboardData} disabled={loading}>
            {loading ? '↻' : '↻'}
          </button>
          </div>

          {certificates.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-icon" />
              <h3 className="empty-title">No Certificates Yet</h3>
              <p className="empty-text">Your issued certificates will appear here once universities upload them.</p>
            </div>
          ) : (
            <div className="certificates-grid">
              {certificates.map((certificate) => (
                <div key={certificate._id} className="certificate-card">
                  <div className="certificate-header">
                    <div className="certificate-icon-wrapper">
                      <FileText className="certificate-icon" />
                    </div>
                    <span className={`status-badge ${certificate.status === 'issued' ? 'status-issued' : 'status-pending'}`}>
                      {certificate.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="certificate-title">
                    {getCertificateTypeDisplay(certificate.certificateType)}
                  </h3>
                  
                  <div className="certificate-info">
  <div className="cert-info-item">
    <School className="cert-info-icon" />
    {certificate.universityName}
  </div>
  {/* ✅ FIXED: Show program if available, otherwise show course */}
  <div className="cert-info-item">
    <GraduationCap className="cert-info-icon" />
    {certificate.program || certificate.course || 'N/A'}
  </div>
  {/* ✅ FIXED: Show year of graduation */}
  <div className="cert-info-item">
    <Calendar className="cert-info-icon" />
    Issued: {formatDate(certificate.dateOfIssue)}
    {certificate.yearOfGraduation && ` • Graduated: ${certificate.yearOfGraduation}`}
  </div>
</div>

                  {/* Blockchain ID */}
                  <div className="blockchain-section">
                    <div className="blockchain-header">
                      <span className="blockchain-label">BLOCKCHAIN ID</span>
                      <button
                        onClick={() => copyToClipboard(certificate.blockchainId, certificate._id)}
                        className="copy-btn"
                        title="Copy to clipboard"
                      >
                        <Copy className="copy-icon" />
                      </button>
                    </div>
                    <div className="blockchain-id">
                      {certificate.blockchainId}
                    </div>
                    {copied === certificate._id && (
                      <div className="copied-message">Copied to clipboard!</div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="certificate-actions">
                    <button
                      onClick={() => handleViewCertificate(certificate)}
                      className="action-btn view-btn"
                    >
                      <Eye className="action-icon" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="action-btn download-btn"
                    >
                      <Download className="action-icon" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificate Viewer Modal */}
        {selectedCertificate && (
          <div className="modal-overlay" onClick={() => setSelectedCertificate(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Certificate Details</h3>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-grid">
                  <div className="modal-section">
  <h4 className="modal-section-title">Certificate Information</h4>
  <div className="modal-info-list">
    <div className="modal-info-item">
      <span className="modal-label">Type:</span>
      <span className="modal-value">{getCertificateTypeDisplay(selectedCertificate.certificateType)}</span>
    </div>
    <div className="modal-info-item">
      <span className="modal-label">Student Name:</span>
      <span className="modal-value">{selectedCertificate.studentName}</span>
    </div>
    {/* ✅ FIXED: Show program/course */}
    <div className="modal-info-item">
      <span className="modal-label">Program/Course:</span>
      <span className="modal-value">{selectedCertificate.program || selectedCertificate.course || 'N/A'}</span>
    </div>
    <div className="modal-info-item">
      <span className="modal-label">University:</span>
      <span className="modal-value">{selectedCertificate.universityName}</span>
    </div>
    <div className="modal-info-item">
      <span className="modal-label">University ID:</span>
      <span className="modal-value">{selectedCertificate.universityId}</span>
    </div>
    {/* ✅ FIXED: Show year of graduation if available */}
    {selectedCertificate.yearOfGraduation && (
      <div className="modal-info-item">
        <span className="modal-label">Year of Graduation:</span>
        <span className="modal-value">{selectedCertificate.yearOfGraduation}</span>
      </div>
    )}
    <div className="modal-info-item">
      <span className="modal-label">Issue Date:</span>
      <span className="modal-value">{formatDate(selectedCertificate.dateOfIssue)}</span>
    </div>
  </div>
</div>

                  <div className="modal-section">
                    <h4 className="modal-section-title">Blockchain Information</h4>
                    <div className="modal-info-list">
                      <div className="modal-info-block">
                        <span className="modal-label">Blockchain ID:</span>
                        <div className="modal-code-block">
                          {selectedCertificate.blockchainId}
                        </div>
                      </div>
                      <div className="modal-info-block">
                        <span className="modal-label">IPFS Hash:</span>
                        <div className="modal-code-block">
                          {selectedCertificate.ipfsHash}
                        </div>
                      </div>
                      <div className="modal-info-item">
                        <span className="modal-label">Status:</span>
                        <span className="modal-value status-text">{selectedCertificate.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    onClick={() => handleDownloadCertificate(selectedCertificate)}
                    className="modal-btn download-modal-btn"
                  >
                    <Download className="modal-btn-icon" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => copyToClipboard(selectedCertificate.blockchainId, 'modal')}
                    className="modal-btn copy-modal-btn"
                  >
                    <Copy className="modal-btn-icon" />
                    {copied === 'modal' ? 'Copied!' : 'Copy ID'}
                  </button>
                  <a
                    href="/verify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-btn verify-modal-btn"
                  >
                    <ExternalLink className="modal-btn-icon" />
                    Verify
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;