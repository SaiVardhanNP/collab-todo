const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // 1. Using the correct environment variable name: MONGO_URI
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    // 2. Logging the actual error message for easier debugging
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // 3. Exiting the process with a failure code is critical
    process.exit(1);
  }
};

// 4. Using the standard and simpler module export
module.exports = connectDB;