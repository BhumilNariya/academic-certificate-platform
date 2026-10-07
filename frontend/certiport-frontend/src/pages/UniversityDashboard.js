import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Calendar, Phone, Globe, FileText, Shield } from 'lucide-react';
import '../styles/UniversityDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function UniversityDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Template upload state
  const [templateFile, setTemplateFile] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('marks_card');
  
  // Certificate issue state
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [certificateType, setCertificateType] = useState('marks_card');
  const [formFields, setFormFields] = useState({});
  const [subjects, setSubjects] = useState([{ name: '', maxMarks: '', obtainedMarks: '', grade: '' }]);
  const [customPlaceholders, setCustomPlaceholders] = useState([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Profile state
  const [showProfile, setShowProfile] = useState(false);
  const [universityProfile, setUniversityProfile] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    certificateType: '',
    course: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'university') {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchTemplates();
    fetchCertificates();
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchUniversityProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/university/profile`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setUniversityProfile(data.university);
        setShowProfile(true);
      } else {
        setError(data.msg || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/university/templates`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Fetch templates error:', err);
    }
  };

  const fetchCertificates = async (filterParams = {}) => {
    try {
      const queryParams = new URLSearchParams(
        Object.fromEntries(Object.entries(filterParams).filter(([_, v]) => v))
      ).toString();
      const response = await fetch(`${API_BASE_URL}/university/certificates?${queryParams}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setCertificates(data.certificates || []);
      }
    } catch (err) {
      console.error('Fetch certificates error:', err);
    }
  };

  const handleTemplateUpload = async (e) => {
    e.preventDefault();
    if (!templateFile || !templateName || !templateType) {
      setError('Please fill all fields and select a file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('templateFile', templateFile);
    formData.append('templateName', templateName);
    formData.append('certificateType', templateType);

    try {
      const response = await fetch(`${API_BASE_URL}/university/template/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Template uploaded successfully!');
        setTemplateFile(null);
        setTemplateName('');
        setTemplateType('marks_card');
        document.getElementById('template-file-input').value = '';
        fetchTemplates();
      } else {
        setError(data.msg || 'Failed to upload template');
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: '', maxMarks: '', obtainedMarks: '', grade: '' }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const addCustomPlaceholder = () => {
    setCustomPlaceholders([...customPlaceholders, { name: '', value: '' }]);
  };

  const handleCustomPlaceholderChange = (index, field, value) => {
    const newPlaceholders = [...customPlaceholders];
    newPlaceholders[index][field] = value;
    setCustomPlaceholders(newPlaceholders);
  };

  const removeCustomPlaceholder = (index) => {
    setCustomPlaceholders(customPlaceholders.filter((_, i) => i !== index));
  };

  const getCertificateFields = () => {
    const commonFields = {
      studentName: '',
      studentEmail: '',
      registerNo: ''
    };

    switch (certificateType) {
      case 'marks_card':
        return {
          ...commonFields,
          course: '',
          semester: '',
          examDate: ''
        };
      case 'transfer':
        return {
          ...commonFields,
          parentName: '',
          collegeName: '',
          admissionDate: '',
          leavingDate: '',
          course: '',
          tcNumber: ''
        };
      case 'migration':
        return {
          ...commonFields,
          parentName: '',
          collegeName: '',
          course: '',
          completionYear: '',
          migrationNo: '',
          registrarName: ''
        };
      case 'grade_card':
        return {
          ...commonFields,
          faculty: '',
          course: '',
          complementaryCourses: '',
          programCompletionDate: '',
          degree: '',
          className: '',
          grade: '',
          certificateNo: '',
          viceChancellorName: ''
        };
      default:
        return commonFields;
    }
  };

  useEffect(() => {
    setFormFields(getCertificateFields());
    setSubjects([{ name: '', maxMarks: '', obtainedMarks: '', grade: '' }]);
    setCustomPlaceholders([]);
  }, [certificateType]);

  const handlePreview = async () => {
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    if (!formFields.studentEmail || !formFields.studentName) {
      setError('Please fill required fields: Student Name and Email');
      return;
    }

    setLoading(true);
    setError('');

    const certificateData = {
      ...formFields,
      subjects: certificateType === 'marks_card' ? subjects : undefined
    };

    customPlaceholders.forEach(ph => {
      if (ph.name && ph.value) {
        certificateData[ph.name] = ph.value;
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/university/certificate/preview`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          certificateData
        })
      });

      if (response.ok) {
        const html = await response.text();
        setPreviewHtml(html);
        setShowPreview(true);
      } else {
        const data = await response.json();
        setError(data.msg || 'Preview failed');
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    if (!formFields.studentEmail || !formFields.studentName) {
      setError('Please fill required fields: Student Name and Email');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const certificateData = {
      ...formFields,
      subjects: certificateType === 'marks_card' ? subjects : undefined
    };

    customPlaceholders.forEach(ph => {
      if (ph.name && ph.value) {
        certificateData[ph.name] = ph.value;
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/university/certificate/issue`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          certificateData,
          studentEmail: formFields.studentEmail
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Certificate issued successfully! Blockchain ID: ${data.certificate.blockchainId}`);
        setFormFields(getCertificateFields());
        setSubjects([{ name: '', maxMarks: '', obtainedMarks: '', grade: '' }]);
        setCustomPlaceholders([]);
        setSelectedTemplate('');
        fetchCertificates();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.msg || 'Failed to issue certificate');
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (certificateId) => {
    if (!window.confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/university/certificate/${certificateId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Certificate revoked successfully');
        fetchCertificates(filters);
      } else {
        setError(data.msg || 'Failed to revoke certificate');
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    fetchCertificates(newFilters);
  };

  const renderField = (fieldName, fieldLabel, fieldType = 'text', canDelete = true) => {
    const isMandatory = ['studentName', 'studentEmail', 'registerNo'].includes(fieldName);
    
    return (
      <div key={fieldName} className="form-field">
        <label>
          {fieldLabel}{isMandatory && <span className="required">*</span>}:
        </label>
        <div className="field-with-delete">
          <input
            type={fieldType}
            value={formFields[fieldName] || ''}
            onChange={(e) => setFormFields({ ...formFields, [fieldName]: e.target.value })}
            placeholder={fieldLabel}
            required={isMandatory}
          />
          {canDelete && !isMandatory && (
            <button
              type="button"
              className="delete-field-btn"
              onClick={() => {
                const newFields = { ...formFields };
                delete newFields[fieldName];
                setFormFields(newFields);
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="university-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
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
              <Building2 className="avatar-icon" />
            </div>
            <div className="user-details">
              <h1 className="user-name">University Dashboard</h1>
              <p className="user-email">{user?.email || 'University Portal'}</p>
              <div className="verified-badge">
                <Shield className="verified-icon" />
                <span className="verified-text">Verified University</span>
              </div>
            </div>
          </div>
          <button 
            className="profile-btn" 
            onClick={() => showProfile ? setShowProfile(false) : fetchUniversityProfile()}
            disabled={loading}
          >
            <User className="btn-icon" />
            {showProfile ? 'Hide Profile' : 'View Profile'}
          </button>
        </div>
      </div>

      {/* Profile Section */}
      {showProfile && universityProfile && (
        <div className="profile-section">
          <h2 className="section-title">
            <Building2 className="section-icon" />
            University Profile
          </h2>
          
          <div className="profile-grid">
            {/* Personal Information */}
            <div className="profile-card">
              <h3 className="card-title">Basic Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <Building2 className="info-icon" />
                  <span className="info-label">University Name:</span>
                  <span className="info-value">{universityProfile.universityDetails?.universityName || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <Mail className="info-icon" />
                  <span className="info-label">Email:</span>
                  <span className="info-value">{universityProfile.email}</span>
                </div>
                <div className="info-item">
                  <FileText className="info-icon" />
                  <span className="info-label">University ID:</span>
                  <span className="info-value">{universityProfile.universityDetails?.universityId || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <FileText className="info-icon" />
                  <span className="info-label">Registration Number:</span>
                 <span className="info-value">{universityProfile.universityDetails?.accreditationId || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="profile-card">
              <h3 className="card-title">Contact Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <Building2 className="info-icon" />
                  <span className="info-label">Address:</span>
                  <span className="info-value">{universityProfile.universityDetails?.officialAddress || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <Phone className="info-icon" />
                  <span className="info-label">Phone:</span>
                 <span className="info-value">{universityProfile.universityDetails?.contactNumber || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <Calendar className="info-icon" />
                  <span className="info-label">Account Created:</span>
                  <span className="info-value">{formatDate(universityProfile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
          Upload Templates
        </button>
        <button className={`tab-btn ${activeTab === 'issue' ? 'active' : ''}`} onClick={() => setActiveTab('issue')}>
          Issue Certificates
        </button>
        <button className={`tab-btn ${activeTab === 'issued' ? 'active' : ''}`} onClick={() => setActiveTab('issued')}>
          Issued Certificates
        </button>
      </div>

      {activeTab === 'templates' && (
        <div className="section">
          <h2>Upload Certificate Template</h2>
          <form onSubmit={handleTemplateUpload} className="template-form">
            <div className="form-group">
              <label>Template Name:</label>
              <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g., Engineering Marks Card" required />
            </div>
            <div className="form-group">
              <label>Certificate Type:</label>
              <select value={templateType} onChange={(e) => setTemplateType(e.target.value)} required>
                <option value="marks_card">Marks Card</option>
                <option value="transfer">Transfer Certificate</option>
                <option value="migration">Migration Certificate</option>
                <option value="grade_card">Degree Certificate</option>
              </select>
            </div>
            <div className="form-group">
              <label>Upload Template File (.ejs or .html):</label>
              <input id="template-file-input" type="file" accept=".ejs,.html,.htm" onChange={(e) => setTemplateFile(e.target.files[0])} required />
              <small>Upload an EJS or HTML template file with placeholders</small>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Template'}
            </button>
          </form>

          <div className="templates-list">
            <h3>Your Templates</h3>
            {templates.length === 0 ? (
              <p className="no-data">No templates uploaded yet</p>
            ) : (
              <div className="templates-grid">
                {templates.map(template => (
                  <div key={template._id} className="template-card">
                    <h4>{template.templateName}</h4>
                    <p className="template-type">{template.certificateType.replace('_', ' ').toUpperCase()}</p>
                    <p className="template-date">Uploaded: {new Date(template.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'issue' && (
        <div className="section">
          <h2>Issue Certificate</h2>
          
          <div className="form-group">
            <label>Select Template:</label>
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} required>
              <option value="">-- Select Template --</option>
              {templates.map(template => (
                <option key={template._id} value={template._id}>
                  {template.templateName} ({template.certificateType.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Certificate Type:</label>
            <select value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
              <option value="marks_card">Marks Card</option>
              <option value="transfer">Transfer Certificate</option>
              <option value="migration">Migration Certificate</option>
              <option value="grade_card">Grade Card</option>
            </select>
          </div>

          <form onSubmit={handleIssueCertificate} className="certificate-form">
            <div className="fields-section">
              <h3>Certificate Details</h3>
              {Object.keys(formFields).map(fieldName => {
                const fieldLabel = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const fieldType = fieldName.includes('Date') ? 'date' : fieldName.includes('Year') ? 'number' : fieldName.includes('Email') ? 'email' : 'text';
                const canDelete = !['studentName', 'studentEmail', 'registerNo'].includes(fieldName);
                return renderField(fieldName, fieldLabel, fieldType, canDelete);
              })}
            </div>

            {certificateType === 'marks_card' && (
              <div className="subjects-section">
                <h3>Subjects</h3>
                {subjects.map((subject, index) => (
                  <div key={index} className="subject-row">
                    <input type="text" placeholder="Subject Name" value={subject.name} onChange={(e) => handleSubjectChange(index, 'name', e.target.value)} required />
                    <input type="number" placeholder="Max Marks" value={subject.maxMarks} onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)} required />
                    <input type="number" placeholder="Obtained" value={subject.obtainedMarks} onChange={(e) => handleSubjectChange(index, 'obtainedMarks', e.target.value)} required />
                    <input type="text" placeholder="Grade" value={subject.grade} onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)} required />
                    {subjects.length > 1 && <button type="button" className="delete-btn" onClick={() => removeSubject(index)}>×</button>}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={addSubject}>+ Add Subject</button>
              </div>
            )}

            <div className="custom-placeholders-section">
              <h3>Custom Placeholders</h3>
              {customPlaceholders.map((placeholder, index) => (
                <div key={index} className="placeholder-row">
                  <input type="text" placeholder="Placeholder Name" value={placeholder.name} onChange={(e) => handleCustomPlaceholderChange(index, 'name', e.target.value)} />
                  <input type="text" placeholder="Value" value={placeholder.value} onChange={(e) => handleCustomPlaceholderChange(index, 'value', e.target.value)} />
                  <button type="button" className="delete-btn" onClick={() => removeCustomPlaceholder(index)}>×</button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addCustomPlaceholder}>+ Add Placeholder</button>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handlePreview} disabled={loading || !selectedTemplate}>Preview</button>
              <button type="submit" className="btn-primary" disabled={loading || !selectedTemplate}>
                {loading ? 'Issuing...' : 'Issue Certificate'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'issued' && (
        <div className="section">
          <h2>Issued Certificates</h2>
          
          <div className="filters-section">
            <input type="text" placeholder="Search by ID, Register No, or Name" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
            <select value={filters.certificateType} onChange={(e) => handleFilterChange('certificateType', e.target.value)}>
              <option value="">All Types</option>
              <option value="marks_card">Marks Card</option>
              <option value="transfer">Transfer</option>
              <option value="migration">Migration</option>
              <option value="grade_card">Grade Card</option>
            </select>
            <input type="text" placeholder="Course" value={filters.course} onChange={(e) => handleFilterChange('course', e.target.value)} />
            <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} />
            <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} />
          </div>

          <div className="certificates-table-container">
            {certificates.length === 0 ? (
              <p className="no-data">No certificates issued yet</p>
            ) : (
              <table className="certificates-table">
                <thead>
                  <tr>
                    <th>Blockchain ID</th>
                    <th>Student Name</th>
                    <th>Register No</th>
                    <th>Type</th>
                    <th>Course</th>
                    <th>Issue Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map(cert => (
                    <tr key={cert._id}>
                      <td className="blockchain-id">{cert.blockchainId}</td>
                      <td>{cert.studentName}</td>
                      <td>{cert.registerNo || cert.enrollmentNumber || '-'}</td>
                      <td>{cert.certificateType.replace('_', ' ')}</td>
                      <td>{cert.course || '-'}</td>
                      <td>{new Date(cert.dateOfIssue).toLocaleDateString()}</td>
                      <td><span className={`status-badge status-${cert.status}`}>{cert.status}</span></td>
                      <td className="actions-cell">
                        <button className="view-btn" onClick={() => window.open(`http://localhost:5000/${cert.pdfPath}`, '_blank')}>View</button>
                        {cert.status !== 'revoked' && <button className="revoke-btn" onClick={() => handleRevoke(cert._id)}>Revoke</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Certificate Preview</h3>
              <button className="close-modal" onClick={() => setShowPreview(false)}>×</button>
            </div>
            <div className="modal-body">
              <iframe srcDoc={previewHtml} title="Preview" className="preview-iframe" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}