require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

process.on('SIGTERM', () => {
  const { stopEventListeners } = require('./src/services/eventListenerService');
  stopEventListeners();
  server.close(() => {
    console.log('Process terminated');
  });
});