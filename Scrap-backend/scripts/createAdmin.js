const path = require('path');
const dns = require('dns');

// Fix: Windows/ISP DNS often fails querySrv for mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore
}

require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function createAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing in Scrap-backend/.env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
  });
  console.log('Connected:', mongoose.connection.host);

  const existing = await User.findOne({ email: 'admin@unclescrap.com' });
  if (existing) {
    // Ensure role is admin (in case user exists as normal)
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log('Existing user upgraded to admin:', existing.email);
    } else {
      console.log('Admin already exists:', existing.email);
    }
    console.log('Email:    admin@unclescrap.com');
    console.log('Password: Admin@123  (if you never changed it)');
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

createAdmin().catch((err) => {
  console.error(err);
  console.error('\nIf you still see querySrv ECONNREFUSED:');
  console.error('  1) Set PC DNS to 8.8.8.8 / 1.1.1.1');
  console.error('  2) Or turn off VPN / try mobile hotspot');
  console.error('  3) Atlas Network Access: allow 0.0.0.0/0');
  process.exit(1);
});
