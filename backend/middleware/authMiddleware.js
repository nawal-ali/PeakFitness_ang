const jwt = require("jsonwebtoken");
const { blacklistedTokens, isTokenBlacklisted } = require("./tokenBlacklist");
require("dotenv").config();

function authenticateToken(req, res, next) {
  // Get token from either cookies or Authorization header
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ message: "Access denied - No token provided" });
  }

  console.log(`🔐 Token received. Blacklist size: ${blacklistedTokens.size}`);

  if (isTokenBlacklisted(token)) {
    console.log("🚫 Token is blacklisted");
    return res.status(401).json({ message: "Token invalid (logged out)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ Token valid for user: ${decoded.userId}`);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.log(`❌ Token verification failed: ${error.message}`);
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = authenticateToken;