const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/generate-token', (req, res) => {
  // Fetch user data from a database or another secure source
  const userId = 'real-user-id';
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ message: 'API_KEY is not configured properly' });
  }

  const payload = {
    sub: userId,
    apiKey: apiKey,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    // Add any additional claims
  };

  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    return res
      .status(500)
      .json({ message: 'JWT_SECRET is not configured properly' });
  }

  const token = jwt.sign(payload, secretKey);
  res.json({ token });
});

app.post('/validate-token', (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ message: 'Token is missing' });
  }

  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    return res
      .status(500)
      .json({ message: 'JWT_SECRET is not configured properly' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const apiKey = decoded.apiKey;

    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // You may perform additional checks or fetch more user-related data here

    res.json({ message: 'Token is valid', user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve 'index.html' for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
