const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log(process.env.MONGODB_URI);
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file or Render settings.');
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    // Don't exit on Render unless critical, but here it's fine for development/debug
  }
};

module.exports = connectDB;
