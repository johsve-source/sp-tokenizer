// authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

function generateToken(userId, apiKey) {
  const payload = {
    sub: userId,
    apiKey,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    // Add any additional claims
  };

  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    throw new Error('JWT_SECRET is not configured properly');
  }

  return jwt.sign(payload, secretKey);
}

function validateToken(token) {
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    throw new Error('JWT_SECRET is not configured properly');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const apiKey = decoded.apiKey;

    if (apiKey !== process.env.API_KEY) {
      throw new Error('Invalid API key');
    }

    // You may perform additional checks or fetch more user-related data here

    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = { generateToken, validateToken };
