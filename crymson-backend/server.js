const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());          // Allow frontend requests from different port
app.use(express.json());  // Parse JSON request bodies

// Routes
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
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
