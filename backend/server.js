const express = require('express');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/users');
const { EventLogger } = require('./services/eventLogger');
const { logger } = require('./utils/logger');

// Add immediate test logs
logger.info('Server initialization beginning');

const app = express();

// Initialize event logger
const RPC_URL = process.env.RPC_URL;
const FAUCET_ADDRESS = process.env.FAUCET_ADDRESS;

if (!RPC_URL || !FAUCET_ADDRESS) {
  logger.error('Missing required environment variables');
  process.exit(1);
}

logger.info('Config loaded:', { RPC_URL, FAUCET_ADDRESS });

const eventLogger = new EventLogger(RPC_URL, FAUCET_ADDRESS);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());

// Use routes
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, async () => {
  logger.info(`Express server starting on port ${PORT}`);
  try {
    await eventLogger.startListening();
    logger.info(`Server running on port ${PORT} with event logging enabled`);
  } catch (error) {
    logger.error('Failed to start event logger:', error);
  }
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutdown initiated');
  try {
    await eventLogger.stopListening();
    server.close(() => {
      logger.info('Server shutting down...');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Add test endpoint
app.get('/test-log', (req, res) => {
  logger.info('Test endpoint hit');
  res.send('Logged test message');
}); 