// export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png' 
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedUniversities, setApprovedUniversities] = useState([]);
  const [stats, setStats] = useState({
    totalUniversities: 0,
    totalStudents: 0,
    totalCertificates: 0,
    pendingRequests: 0
  });
  const [actionLoading, setActionLoading] = useState({});

  // Check if user is admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    
    if (!user || !token || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [statsRes, pendingRes, universitiesRes] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/pending-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/universities', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingRequests(pendingData.requests);
      }
      
      if (universitiesRes.ok) {
        const universitiesData = await universitiesRes.json();
        setApprovedUniversities(universitiesData.universities);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUniversity = async (requestId) => {
    setActionLoading(prev => ({ ...prev, [requestId]: 'approving' }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/approve/${requestId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`University approved successfully! University ID: ${data.universityId}`);
        fetchDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Error approving university');
      }
    } catch (error) {
      console.error('Error approving university:', error);
      alert('Network error occurred');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const handleRejectUniversity = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    setActionLoading(prev => ({ ...prev, [requestId]: 'rejecting' }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reject/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        alert('University request rejected');
        fetchDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Error rejecting university');
      }
    } catch (error) {
      console.error('Error rejecting university:', error);
      alert('Network error occurred');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const handleRemoveUniversity = async (universityId, universityName) => {
    if (!window.confirm(`Are you sure you want to remove ${universityName}? This action cannot be undone.`)) {
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [universityId]: 'removing' }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/university/${universityId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('University removed successfully');
        fetchDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Error removing university');
      }
    } catch (error) {
      console.error('Error removing university:', error);
      alert('Network error occurred');
    } finally {
      setActionLoading(prev => ({ ...prev, [universityId]: null }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <img src={logo} alt="CertiPort" className="admin-logo" />
            <div>
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">Manage university registrations and system overview</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
            {loading ? '↻' : '↻'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <h2 className="section-title">Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏛️</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalUniversities}</div>
                <div className="stat-label">Active Universities</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎓</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalStudents}</div>
                <div className="stat-label">Registered Students</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📜</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalCertificates}</div>
                <div className="stat-label">Certificates Issued</div>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <div className="stat-number">{stats.pendingRequests}</div>
                <div className="stat-label">Pending Requests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending University Registrations */}
        <div className="admin-section">
          <h2 className="section-title">
            Pending University Registrations ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No pending university registrations.</p>
            </div>
          ) : (
            <div className="requests-list">
              {pendingRequests.map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-header">
                    <div className="university-info">
                      <h3 className="university-name">
                        {request.universityDetails.universityName}
                      </h3>
                      <p className="university-location">
                        {request.universityDetails.city}, {request.universityDetails.state}
                      </p>
                      <p className="request-date">
                        Requested on: {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <div className="request-actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleApproveUniversity(request._id)}
                        disabled={actionLoading[request._id]}
                      >
                        {actionLoading[request._id] === 'approving' ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleRejectUniversity(request._id)}
                        disabled={actionLoading[request._id]}
                      >
                        {actionLoading[request._id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="request-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <strong>Email:</strong> {request.email}
                      </div>
                      <div className="detail-item">
                        <strong>Contact Person:</strong> {request.universityDetails.contactPersonName}
                      </div>
                      <div className="detail-item">
                        <strong>Phone:</strong> {request.universityDetails.contactNumber}
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item">
                        <strong>Address:</strong> {request.universityDetails.officialAddress}
                      </div>
                      <div className="detail-item">
                        <strong>Accreditation ID:</strong> {request.universityDetails.accreditationId}
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item full-width">
                        <strong>Courses Offered:</strong> 
                        <div className="courses-list">
                          {request.universityDetails.coursesOffered.map((course, index) => (
                            <span key={index} className="course-tag">{course}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {request.universityDetails.reasonForRegistration && (
                      <div className="detail-row">
                        <div className="detail-item full-width">
                          <strong>Reason for Registration:</strong>
                          <p className="reason-text">{request.universityDetails.reasonForRegistration}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Universities */}
        <div className="admin-section">
          <h2 className="section-title">
            All Universities ({approvedUniversities.length})
          </h2>
          
          {approvedUniversities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏛️</div>
              <p>No universities found.</p>
            </div>
          ) : (
            <div className="universities-grid">
              {approvedUniversities.map((university) => (
                <div key={university._id} className="university-card">
                  <div className="university-header">
                    <div className="university-main-info">
                      <h3 className="university-name">
                        {university.universityDetails.universityName}
                      </h3>
                      <p className="university-id">
                        ID: {university.universityDetails.universityId}
                      </p>
                      <p className="university-location">
                        {university.universityDetails.city}, {university.universityDetails.state}
                      </p>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveUniversity(university._id, university.universityDetails.universityName)}
                      disabled={actionLoading[university._id]}
                      title="Remove University"
                    >
                      {actionLoading[university._id] === 'removing' ? '...' : '×'}
                    </button>
                  </div>
                  
                  <div className="university-stats">
                    <div className="stat-item">
                      <div className="stat-icon">📜</div>
                      <div>
                        <div className="stat-value">{university.certificateCount || 0}</div>
                        <div className="stat-label">Certificates</div>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon">✅</div>
                      <div>
                        <div className="stat-value">
                          {formatDate(university.universityDetails.approvalDate)}
                        </div>
                        <div className="stat-label">Approved</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="university-contact">
                    <p><strong>Contact:</strong> {university.universityDetails.contactPersonName}</p>
                    <p><strong>Email:</strong> {university.email}</p>
                    <p><strong>Phone:</strong> {university.universityDetails.contactNumber}</p>
                  </div>
                  
                  <div className="courses-preview">
                    <strong>Courses:</strong>
                    <div className="courses-list">
                      {university.universityDetails.coursesOffered.slice(0, 3).map((course, index) => (
                        <span key={index} className="course-tag small">{course}</span>
                      ))}
                      {university.universityDetails.coursesOffered.length > 3 && (
                        <span className="course-tag small more">
                          +{university.universityDetails.coursesOffered.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;