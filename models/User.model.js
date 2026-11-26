const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  userId: "String",
  username: "String",
  email: "String",
  passwordHash: "String",
  avatarUrl: "String",
  location: "String",
  preferredGames: ["String"],
  status: "String",
  createdAt: "Date",
});

const User = model("User", userSchema);

module.exports = User;
