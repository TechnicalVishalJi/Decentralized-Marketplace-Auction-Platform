const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const blockchainConfig = require('./config/blockchain')
const routes = require('./routes');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

blockchainConfig.initialize()
  .then(() => {
    console.log('Blockchain ready');
  })
  .catch(err => {
    console.error(`Blockchain failed: ${err.message}`);
  });

blockchainConfig.initialize()
  .then(() => {
    const { startEventListeners } = require('./services/eventListenerService');
    startEventListeners();
    console.log('Blockchain + listeners ready');
  })
  .catch(err => {
    console.error(`Blockchain failed: ${err.message}`);
  });

module.exports = app;