require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email: 'admin@unclescrap.com' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Uncle Scrap Admin',
    email: 'admin@unclescrap.com',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('Admin created!');
  console.log('Email:    admin@unclescrap.com');
  console.log('Password: Admin@123');
  console.log('ID:', admin._id);
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
