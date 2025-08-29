// Stores invalidated tokens
const blacklistedTokens = new Set();

// Add token to blacklist
function blacklistToken(token) {
  blacklistedTokens.add(token);
  console.log(`Token blacklisted. Current size: ${blacklistedTokens.size}`);
}

// Check if token is blacklisted
function isTokenBlacklisted(token) {
  return blacklistedTokens.has(token);
}

module.exports = {
  blacklistedTokens, // Export the Set directly
  blacklistToken,
  isTokenBlacklisted
};