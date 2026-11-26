const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/User.model");

router.post("/", async (req, res, next) => {
  const { username, email, password } = req.body || {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (
    typeof username !== "string" ||
    username.trim().length < 2 ||
    username.trim().length > 50 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return res.status(400).json({
      message: "Provide a username, valid email, and password (8-128 characters)",
    });
  }

  if (!process.env.TOKEN_SECRET) {
    return res.status(500).json({ message: "TOKEN_SECRET is not configured" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
    });
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A user with this email already exists" });
    }

    return next(error);
  }
});

module.exports = router;
