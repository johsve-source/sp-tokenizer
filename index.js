const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { generateToken, validateToken } = require('./authMiddleware');

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

  try {
    const token = generateToken(userId, apiKey);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/validate-token', (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ message: 'Token is missing' });
  }

  try {
    const user = validateToken(token);
    res.json({ message: 'Token is valid', user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve 'index.html' for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;

// HTTPS Configuration (for development)
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  const privateKey = fs.readFileSync('./openssl/privkey.pem', 'utf8');
  const certificate = fs.readFileSync('./openssl/certificate.pem', 'utf8');
  const credentials = { key: privateKey, cert: certificate };

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`);
  });
} else {
  // In production, you might want to use a reverse proxy (e.g., Nginx) for HTTPS termination
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
