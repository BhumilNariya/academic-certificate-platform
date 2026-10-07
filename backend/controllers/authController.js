// module.exports = { register, login };

const User = require('../models/User');
const PendingRequest = require('../models/PendingRequest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role,
      // Student fields
      fullName,
      dateOfBirth,
      program,
      enrollmentNumber,
      universityName,
      yearOfAdmission,
      yearOfGraduation,
      pgEnrollmentNumber,
      pgUniversityName,
      pgYearOfAdmission,
      pgYearOfGraduation,
      // University fields
      universityNameField,
      contactPersonName,
      contactNumber,
      officialAddress,
      city,
      state,
      country,
      accreditationId,
      coursesOffered,
      reasonForRegistration
    } = req.body;

    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({ msg: 'Email, password, and role are required' });
    }

    // Check if email already exists in User collection
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Check if email already exists in PendingRequest collection
    let existingRequest = await PendingRequest.findOne({ email });
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ 
          msg: 'Registration request is already pending approval' 
        });
      } else if (existingRequest.status === 'rejected') {
        return res.status(400).json({ 
          msg: 'Previous registration request was rejected. Please contact administrator.' 
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role === 'student') {
      // Validate required student fields
      if (!fullName || !dateOfBirth || !program || !enrollmentNumber || !universityName || !yearOfAdmission || !yearOfGraduation) {
        return res.status(400).json({ msg: 'All student fields are required' });
      }

      const studentData = {
        email,
        password: hashedPassword,
        role: 'student',
        studentDetails: {
          fullName,
          dateOfBirth: new Date(dateOfBirth),
          program,
          enrollmentNumber,
          universityName,
          yearOfAdmission: parseInt(yearOfAdmission),
          yearOfGraduation: parseInt(yearOfGraduation)
        }
      };

      // Add PG details if program is PG
      if (program === 'pg') {
        if (!pgEnrollmentNumber || !pgUniversityName || !pgYearOfAdmission || !pgYearOfGraduation) {
          return res.status(400).json({ msg: 'All PG fields are required for postgraduate students' });
        }
        
        studentData.studentDetails.pgEnrollmentNumber = pgEnrollmentNumber;
        studentData.studentDetails.pgUniversityName = pgUniversityName;
        studentData.studentDetails.pgYearOfAdmission = parseInt(pgYearOfAdmission);
        studentData.studentDetails.pgYearOfGraduation = parseInt(pgYearOfGraduation);
      }

      // Create student directly in User collection
      const newStudent = new User(studentData);
      await newStudent.save();

      res.status(201).json({ 
        msg: 'Student registration successful! You can now login.',
        canLogin: true
      });

    } else if (role === 'university') {
      // Validate required university fields
      if (!universityNameField || !contactPersonName || !contactNumber || !officialAddress || 
          !city || !state || !country || !accreditationId || !coursesOffered) {
        return res.status(400).json({ msg: 'All university fields are required' });
      }

      // Parse courses offered (comma-separated string to array)
      const coursesArray = coursesOffered
        .split(',')
        .map(course => course.trim())
        .filter(course => course.length > 0);

      // Create pending request for university (not directly in User collection)
      const pendingRequestData = {
        email,
        password: hashedPassword,
        role: 'university',
        universityDetails: {
          universityName: universityNameField,
          contactPersonName,
          contactNumber,
          officialAddress,
          city,
          state,
          country,
          accreditationId,
          coursesOffered: coursesArray,
          reasonForRegistration: reasonForRegistration || ''
        }
      };

      const newPendingRequest = new PendingRequest(pendingRequestData);
      await newPendingRequest.save();

      res.status(201).json({ 
        msg: 'University registration submitted successfully! Please wait for admin approval.',
        canLogin: false,
        pendingApproval: true
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'Email already registered or request already exists' });
    }
    
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found in User collection, checking pending requests...');
      // Check if it's a pending university request
      const pendingRequest = await PendingRequest.findOne({ email });
      if (pendingRequest && pendingRequest.status === 'pending') {
        return res.status(400).json({ 
          msg: 'University registration is pending admin approval. Please wait.',
          pendingApproval: true
        });
      } else if (pendingRequest && pendingRequest.status === 'rejected') {
        return res.status(400).json({ 
          msg: 'University registration was rejected. Please contact administrator.',
          rejectionReason: pendingRequest.rejectionReason
        });
      }
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    console.log('User found:', user.email, 'Role:', user.role);

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    console.log('Password matches, creating token...');

    // Create JWT token
    const payload = { 
      userId: user._id, 
      role: user.role, 
      email: user.email 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Prepare user response data
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    // Add role-specific data for response
    if (user.role === 'student' && user.studentDetails) {
      userData.name = user.studentDetails.fullName;
      userData.studentDetails = user.studentDetails;
    } else if (user.role === 'university' && user.universityDetails) {
      userData.name = user.universityDetails.universityName;
      userData.universityDetails = user.universityDetails;
      userData.universityId = user.universityDetails.universityId;
    }

    console.log('Login successful for:', userData.email);

    res.json({ 
      token, 
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

module.exports = { register, login };