const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Login route
router.post('/login', async (req, res) => {
  const { registrationNumber, password, userType, role } = req.body;
  const expectedPortal = userType || role; // support both keys

  try {
    const user = await User.findOne({ registrationNumber });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    if (expectedPortal && user.role !== expectedPortal) return res.status(403).json({ message: 'Wrong portal' });

    // Create JWT token
    const payload = { id: user._id, role: user.role, registrationNumber: user.registrationNumber };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({ message: 'Login successful', token, role: user.role, user: { name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
