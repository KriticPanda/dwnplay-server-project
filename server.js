// ℹ️ Loads environment variables from a .env file into process.env
const path = require("node:path");

try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch(error) {
  console.warn(".env file not found, using default environment values")
}

// Imports Express (a Node.js framework for handling HTTP requests) and initializes the server
const express = require("express");
const app = express();

// ℹ️ Loads and applies global middleware (CORS, JSON parsing, etc.) for server configurations
const config = require("./config")
config(app);

const connectDB = require("./db");
const mongoose = require("mongoose");
const GameList = require("./models/GamesList.model");

// ℹ️ Test Route. Can be left and used for waking up the server if idle
app.get("/", (req, res, next) => {
  res.json("All good in here");
});

// 👇 Defines and applies route handlers
const indexRouter = require("./routes/index.routes");
app.use("/api", indexRouter);

// ❗ Centralized error handling (must be placed after routes)
const handleErrors = require("./errors")
handleErrors(app);

async function startServer() {
  await connectDB();

  const collectionExists = await mongoose.connection.db
    .listCollections({ name: GameList.collection.name }, { nameOnly: true })
    .hasNext();

  if (!collectionExists) {
    await GameList.createCollection();
    console.log(`Created MongoDB collection: "${GameList.collection.name}"`);
  }

  const PORT = process.env.PORT || 5005;
  app.listen(PORT, () => {
    console.log(`Server listening. Local access on http://localhost:${PORT}`);
  });
}

startServer().catch(async (err) => {
  console.error("Error starting server:", err);
  await mongoose.disconnect();
  process.exitCode = 1;
});
