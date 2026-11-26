const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/User.model");
const { verifyToken } = require("../middlewares/auth.middlewares");

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!process.env.TOKEN_SECRET) {
    return res.status(500).json({ message: "TOKEN_SECRET is not configured" });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/verify", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.userId).select(
      "username email createdAt"
    );

    if (!user) {
      return res.status(401).json({ message: "User for this token was not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
