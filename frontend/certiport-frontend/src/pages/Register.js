
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png' 
import '../styles/Register.css';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    // Student fields
    fullName: '',
    dateOfBirth: '',
    program: '',
    enrollmentNumber: '',
    universityName: '',
    yearOfAdmission: '',
    yearOfGraduation: '',
    // PG specific fields
    pgEnrollmentNumber: '',
    pgUniversityName: '',
    pgYearOfAdmission: '',
    pgYearOfGraduation: '',
    // University fields
    universityNameField: '',
    contactPersonName: '',
    contactNumber: '',
    officialAddress: '',
    city: '',
    state: '',
    country: '',
    accreditationId: '',
    coursesOffered: '',
    reasonForRegistration: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [approvedUniversities, setApprovedUniversities] = useState([]);

  // Fetch approved universities for student dropdown
  useEffect(() => {
    if (formData.role === 'student') {
      fetchApprovedUniversities();
    }
  }, [formData.role]);

  const fetchApprovedUniversities = async () => {
    try {
      const response = await fetch('/api/public/approved-universities');
      if (response.ok) {
        const data = await response.json();
        setApprovedUniversities(data.universities || []);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) newErrors.role = 'Please select a role';

    // Student-specific validations
    if (formData.role === 'student') {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.program) newErrors.program = 'Program selection is required';
      if (!formData.enrollmentNumber) newErrors.enrollmentNumber = 'Enrollment number is required';
      if (!formData.universityName) newErrors.universityName = 'University selection is required';
      if (!formData.yearOfAdmission) newErrors.yearOfAdmission = 'Year of admission is required';
      if (!formData.yearOfGraduation) newErrors.yearOfGraduation = 'Year of graduation is required';
      
      // PG specific validations
      if (formData.program === 'pg') {
        if (!formData.pgEnrollmentNumber) newErrors.pgEnrollmentNumber = 'PG enrollment number is required';
        if (!formData.pgUniversityName) newErrors.pgUniversityName = 'PG university selection is required';
        if (!formData.pgYearOfAdmission) newErrors.pgYearOfAdmission = 'PG year of admission is required';
        if (!formData.pgYearOfGraduation) newErrors.pgYearOfGraduation = 'PG year of graduation is required';
      }
    }

    // University-specific validations
    if (formData.role === 'university') {
      if (!formData.universityNameField) newErrors.universityNameField = 'University name is required';
      if (!formData.contactPersonName) newErrors.contactPersonName = 'Contact person name is required';
      if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
      if (!formData.officialAddress) newErrors.officialAddress = 'Official address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.accreditationId) newErrors.accreditationId = 'Accreditation ID is required';
      if (!formData.coursesOffered) newErrors.coursesOffered = 'Courses offered is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (formData.role === 'university') {
          setMessage('University registration submitted successfully! Please wait for admin approval.');
        } else {
          setMessage('Registration successful! You can now login.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setMessage(data.msg || 'Registration failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="register-logo">
            <img src={logo} alt="CertiPort" />
          </div>
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join the blockchain-powered certificate verification platform</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`message ${formData.role === 'university' && message.includes('submitted') ? 'success-message' : message.includes('successful') ? 'success-message' : 'error-message'}`}>
              {message}
            </div>
          )}

          {/* Basic Info */}
          <div className="form-section">
            <h3 className="section-title">Account Information</h3>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Mail className="input-icon" size={20} />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <Lock className="input-icon" size={20} />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="form-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                 <Lock className="input-icon" size={20} />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">I am a</label>
              <select
                name="role"
                className={`form-input ${errors.role ? 'error' : ''}`}
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="university">University</option>
              </select>
              {errors.role && <span className="error-text">{errors.role}</span>}
            </div>
          </div>

          {/* Student Fields */}
          {formData.role === 'student' && (
            <div className="form-section">
              <h3 className="section-title">Student Information</h3>
              
              <div className="form-group">
                <label className="form-label">Full Name (As per university records)</label>
                <input
                  type="text"
                  name="fullName"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                  {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Program</label>
                  <select
                    name="program"
                    className={`form-input ${errors.program ? 'error' : ''}`}
                    value={formData.program}
                    onChange={handleInputChange}
                  >
                    <option value="">Select program</option>
                    <option value="ug">Undergraduate (UG)</option>
                    <option value="pg">Postgraduate (PG)</option>
                  </select>
                  {errors.program && <span className="error-text">{errors.program}</span>}
                </div>
              </div>

              {/* UG Details */}
              {(formData.program === 'ug' || formData.program === 'pg') && (
                <div className="education-section">
                  <h4 className="subsection-title">
                    {formData.program === 'pg' ? 'Undergraduate Details' : 'Academic Details'}
                  </h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Enrollment/Roll Number</label>
                      <input
                        type="text"
                        name="enrollmentNumber"
                        className={`form-input ${errors.enrollmentNumber ? 'error' : ''}`}
                        placeholder="Enter enrollment number"
                        value={formData.enrollmentNumber}
                        onChange={handleInputChange}
                      />
                      {errors.enrollmentNumber && <span className="error-text">{errors.enrollmentNumber}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">University Name</label>
                      <select
                        name="universityName"
                        className={`form-input ${errors.universityName ? 'error' : ''}`}
                        value={formData.universityName}
                        onChange={handleInputChange}
                      >
                        <option value="">Select university</option>
                        {approvedUniversities.map((uni, index) => (
                          <option key={index} value={uni.name}>
                            {uni.name}
                          </option>
                        ))}
                      </select>
                      {errors.universityName && <span className="error-text">{errors.universityName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Year of Admission</label>
                      <select
                        name="yearOfAdmission"
                        className={`form-input ${errors.yearOfAdmission ? 'error' : ''}`}
                        value={formData.yearOfAdmission}
                        onChange={handleInputChange}
                      >
                        <option value="">Select year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {errors.yearOfAdmission && <span className="error-text">{errors.yearOfAdmission}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Year of Graduation</label>
                      <select
                        name="yearOfGraduation"
                        className={`form-input ${errors.yearOfGraduation ? 'error' : ''}`}
                        value={formData.yearOfGraduation}
                        onChange={handleInputChange}
                      >
                        <option value="">Select year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {errors.yearOfGraduation && <span className="error-text">{errors.yearOfGraduation}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* PG Details */}
              {formData.program === 'pg' && (
                <div className="education-section">
                  <h4 className="subsection-title">Postgraduate Details</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">PG Enrollment/Roll Number</label>
                      <input
                        type="text"
                        name="pgEnrollmentNumber"
                        className={`form-input ${errors.pgEnrollmentNumber ? 'error' : ''}`}
                        placeholder="Enter PG enrollment number"
                        value={formData.pgEnrollmentNumber}
                        onChange={handleInputChange}
                      />
                      {errors.pgEnrollmentNumber && <span className="error-text">{errors.pgEnrollmentNumber}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">PG University Name</label>
                      <select
                        name="pgUniversityName"
                        className={`form-input ${errors.pgUniversityName ? 'error' : ''}`}
                        value={formData.pgUniversityName}
                        onChange={handleInputChange}
                      >
                        <option value="">Select PG university</option>
                        {approvedUniversities.map((uni, index) => (
                          <option key={index} value={uni.name}>
                            {uni.name}
                          </option>
                        ))}
                      </select>
                      {errors.pgUniversityName && <span className="error-text">{errors.pgUniversityName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">PG Year of Admission</label>
                      <select
                        name="pgYearOfAdmission"
                        className={`form-input ${errors.pgYearOfAdmission ? 'error' : ''}`}
                        value={formData.pgYearOfAdmission}
                        onChange={handleInputChange}
                      >
                        <option value="">Select year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {errors.pgYearOfAdmission && <span className="error-text">{errors.pgYearOfAdmission}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">PG Year of Graduation</label>
                      <select
                        name="pgYearOfGraduation"
                        className={`form-input ${errors.pgYearOfGraduation ? 'error' : ''}`}
                        value={formData.pgYearOfGraduation}
                        onChange={handleInputChange}
                      >
                        <option value="">Select year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {errors.pgYearOfGraduation && <span className="error-text">{errors.pgYearOfGraduation}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* University Fields */}
          {formData.role === 'university' && (
            <div className="form-section">
              <h3 className="section-title">University Information</h3>
              
              <div className="form-group">
                <label className="form-label">University Name</label>
                <input
                  type="text"
                  name="universityNameField"
                  className={`form-input ${errors.universityNameField ? 'error' : ''}`}
                  placeholder="Enter university name"
                  value={formData.universityNameField}
                  onChange={handleInputChange}
                />
                {errors.universityNameField && <span className="error-text">{errors.universityNameField}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    name="contactPersonName"
                    className={`form-input ${errors.contactPersonName ? 'error' : ''}`}
                    placeholder="Registrar/Admin name"
                    value={formData.contactPersonName}
                    onChange={handleInputChange}
                  />
                  {errors.contactPersonName && <span className="error-text">{errors.contactPersonName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    className={`form-input ${errors.contactNumber ? 'error' : ''}`}
                    placeholder="Enter contact number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                  {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Official University Address</label>
                <input
                  type="text"
                  name="officialAddress"
                  className={`form-input ${errors.officialAddress ? 'error' : ''}`}
                  placeholder="Enter complete address"
                  value={formData.officialAddress}
                  onChange={handleInputChange}
                />
                {errors.officialAddress && <span className="error-text">{errors.officialAddress}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className={`form-input ${errors.city ? 'error' : ''}`}
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className={`form-input ${errors.state ? 'error' : ''}`}
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                  {errors.state && <span className="error-text">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="country"
                    className={`form-input ${errors.country ? 'error' : ''}`}
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                  {errors.country && <span className="error-text">{errors.country}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Accreditation/Registration ID</label>
                <input
                  type="text"
                  name="accreditationId"
                  className={`form-input ${errors.accreditationId ? 'error' : ''}`}
                  placeholder="Enter accreditation ID"
                  value={formData.accreditationId}
                  onChange={handleInputChange}
                />
                {errors.accreditationId && <span className="error-text">{errors.accreditationId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Courses Offered</label>
                <textarea
                  name="coursesOffered"
                  className={`form-input ${errors.coursesOffered ? 'error' : ''}`}
                  placeholder="List courses separated by commas (e.g., Computer Science, Mechanical Engineering, MBA)"
                  rows="3"
                  value={formData.coursesOffered}
                  onChange={handleInputChange}
                />
                {errors.coursesOffered && <span className="error-text">{errors.coursesOffered}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Registration (Optional)</label>
                <textarea
                  name="reasonForRegistration"
                  className="form-input"
                  placeholder="Brief reason for joining the platform"
                  rows="3"
                  value={formData.reasonForRegistration}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="login-link">
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>

          <div className="security-badge">
            Your information is encrypted and secure
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;