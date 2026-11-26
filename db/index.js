// ℹ️ Mongoose (ODM) handles the connection to MongoDB and provides schema-based modeling.
const mongoose = require("mongoose");

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI);
  const dbName = connection.connections[0].name;
  console.log(`Connected to Mongo! Database name: "${dbName}"`);
  return connection;
}

module.exports = connectDB;