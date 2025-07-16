const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(conn.connection.host);
  } catch (e) {
    console.log("Failed to connect to DB");
  }
};

module.exports={
    connectDB:connectDB
}
