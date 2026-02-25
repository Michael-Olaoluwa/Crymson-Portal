const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Portal';

// Remove legacy mongoose options if present in the connection string
let sanitizedUri = MONGO_URI.replace(/[?&](useNewUrlParser|useUnifiedTopology)=(?:true|false)/gi, '');
sanitizedUri = sanitizedUri.replace(/[?&]$/,'');

async function seedDatabase() {
  try {
    await mongoose.connect(sanitizedUri);
    console.log('MongoDB connected');

    // Clear existing test users
    await User.deleteMany({ registrationNumber: { $in: ['STU001', 'STAFF001', 'ADMIN001'] } });
    console.log('Cleared existing test users');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users
    const testUsers = [
      { name: 'John Doe', registrationNumber: 'STU001', password: hashedPassword, role: 'student' },
      { name: 'Jane Smith', registrationNumber: 'STAFF001', password: hashedPassword, role: 'staff' },
      { name: 'Admin User', registrationNumber: 'ADMIN001', password: hashedPassword, role: 'admission' }
    ];

    const createdUsers = await User.insertMany(testUsers);
    console.log('✓ Test users created:');
    createdUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.registrationNumber}) - Role: ${user.role}`);
    });

    console.log('\nYou can now login with:');
    console.log('  Username: STU001, Password: password123 (Student)');
    console.log('  Username: STAFF001, Password: password123 (Staff/Lecturer)');
    console.log('  Username: ADMIN001, Password: password123 (Admin)');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
