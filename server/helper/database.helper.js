const mongoose = require("mongoose");

const connectDatabase = async () => {
  // Always use local MongoDB since it's running
  const mongoURI = "mongodb://127.0.0.1:27017/andromeda-ico";
  
  try {
    console.log("| Connecting to local MongoDB...");
    
    await mongoose.connect(mongoURI);
    
    console.log("| MongoDB connected successfully!");
    return true;
  } catch (error) {
    console.log("| MongoDB connection error:", error.message);
    console.log("| ");
    console.log("| Make sure MongoDB is running: mongod");
    console.log("| ");
    console.log("| Server will continue but database features won't work.");
    return false;
  }
};

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.log("| MongoDB error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("| MongoDB disconnected");
});

module.exports = { connectDatabase };

