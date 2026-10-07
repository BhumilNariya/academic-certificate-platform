require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { ensureAdminUser } = require('./config/admin');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const universityRoutes = require('./routes/university');
const studentRoutes = require('./routes/student');
const templateRoutes = require('./routes/template');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB(process.env.MONGO_URI)
  .then(ensureAdminUser)
  .catch((error) => {
    console.error('Admin initialization error:', error.message);
    process.exit(1);
  });

// Create necessary directories
const dirs = [
  './uploads',
  './uploads/temp',
  './uploads/certificates',
  './templates'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/template', templateRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    msg: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    msg: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ MongoDB connected`);
  console.log(`✅ Required directories created`);
});

module.exports = app;