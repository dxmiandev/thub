const mongoose = require('mongoose');

const connectDB = async () => {
  // Exit if no MongoDB URI is provided
  if (!process.env.MONGO_URI) {
    console.error('❌ MongoDB URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout for server selection
      socketTimeoutMS: 45000, // 45 second timeout for operations
      heartbeatFrequencyMS: 10000, // Heartbeat every 10 seconds
      retryWrites: true,
      appName: 'TTH', // Application identifier in MongoDB logs
      maxPoolSize: 10, // Maximum number of connections in the pool
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Set up connection error handling
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;