const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "A bearer token is required" });
  }

  try {
    req.payload = jwt.verify(
      authorization.slice("Bearer ".length),
      process.env.TOKEN_SECRET
    );
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token not valid or expired" });
  }
}

module.exports = {
  verifyToken,
};
