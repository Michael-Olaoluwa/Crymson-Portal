const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to verify admission/staff access
const verifyAdminAccess = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admission') {
    return res.status(403).json({ message: 'Only admission office staff can add users' });
  }
  next();
};

// Login route
router.post('/login', async (req, res) => {
  const { registrationNumber, password, userType, role } = req.body;
  const expectedPortal = userType || role; // support both keys

  try {
    const user = await User.findOne({ registrationNumber });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // Portal access control:
    // - Student portal: only accepts student role
    // - Staff portal: accepts staff, admission (any administrative role)
    if (expectedPortal === 'student' && user.role !== 'student') {
      return res.status(403).json({ message: 'Wrong portal' });
    }
    if (expectedPortal === 'staff' && !['staff', 'admission'].includes(user.role)) {
      return res.status(403).json({ message: 'Wrong portal' });
    }

    // Create JWT token
    const payload = { id: user._id, role: user.role, registrationNumber: user.registrationNumber };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({ message: 'Login successful', token, role: user.role, user: { name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Register new user (admin only)
router.post('/register', verifyToken, verifyAdminAccess, async (req, res) => {
  const { name, registrationNumber, password, role } = req.body;

  // Validate input
  if (!name || !registrationNumber || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!['student', 'staff', 'admission'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be: student, staff, or admission' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ registrationNumber });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this registration number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      registrationNumber,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { name: newUser.name, registrationNumber: newUser.registrationNumber, role: newUser.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

// Protected route to get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    // req.user is populated by verifyToken middleware
    res.status(200).json({ id: req.user.id, role: req.user.role, registrationNumber: req.user.registrationNumber });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
