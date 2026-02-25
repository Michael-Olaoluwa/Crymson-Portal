const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
// Allow frontend requests from different port and expose Authorization header
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});
app.use(express.json());  // Parse JSON request bodies

// Serve static files from frontend directories
app.use(express.static(path.join(__dirname, '../Login')));
app.use('/admission', express.static(path.join(__dirname, '../AdmissionOffice')));

// API Routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Portal';
// Remove legacy mongoose options if present in the connection string (e.g. ?useNewUrlParser=true)
let sanitizedUri = MONGO_URI.replace(/[?&](useNewUrlParser|useUnifiedTopology)=(?:true|false)/gi, '');
// Trim trailing ? or & if left
sanitizedUri = sanitizedUri.replace(/[?&]$/,'');

mongoose.connect(sanitizedUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
