const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  userId: "String",
  username: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  passwordHash: { type: String, required: true },
  avatarUrl: "String",
  location: "String",
  preferredGames: ["String"],
  status: "String",
  createdAt: { type: Date, default: Date.now },
});

const User = model("User", userSchema);

module.exports = User;
