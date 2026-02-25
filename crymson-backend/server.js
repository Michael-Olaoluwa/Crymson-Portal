const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'crymson-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/Portal')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// User schema
const userSchema = new mongoose.Schema({
  registrationNumber: { type: String, unique: true },
  password: String,
  role: String,
  firstName: String,
  lastName: String,
  department: String,
  college: String,
  status: String
});

const User = mongoose.model('User', userSchema);

// Login route
app.post('/api/auth/login', async (req, res) => {
  const { registrationNumber, password } = req.body;

  const user = await User.findOne({ registrationNumber });
  if (!user) return res.status(400).send('User not found');

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send('Incorrect password');

  // Save session
  req.session.user = { id: user._id, role: user.role, registrationNumber: user.registrationNumber };

  // Redirect based on role
  if (user.role === 'student') return res.send('Student dashboard');
  if (user.role === 'lecturer') return res.send('Lecturer dashboard');
  if (user.role === 'hod') return res.send('HOD dashboard');
  if (user.role === 'dean') return res.send('Dean dashboard');

  return res.send('Unknown role');
});

// Start server
app.listen(3000, () => console.log('Server running at http://localhost:3000'));

const cors = require('cors');
app.use(cors({
    origin: "http://localhost:5500"
}));
