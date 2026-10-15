
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing from environment variables');
  }

  console.log('Connecting to MongoDB Atlas...');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
