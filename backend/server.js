const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');
const userRoutes = require('./routes/users');
const { EventLogger } = require('./services/eventLogger');
const { logger } = require('./utils/logger');

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Add connection retry options
  connectionTimeoutMillis: 5000,
  retryDelay: 1000,
  max: 20
});

// Test database connection with better error handling
const testDatabaseConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    logger.info('Database connected successfully');
    return true;
  } catch (err) {
    logger.error('Database connection error:', {
      message: err.message,
      code: err.code
    });
    return false;
  }
};

// Use async/await for server startup
const startServer = async () => {
  logger.info('Server initialization beginning');
  
  // Test database connection first
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    logger.error('Failed to connect to database, exiting');
    process.exit(1);
  }

  // Initialize event logger
  const RPC_URL = process.env.RPC_URL;
  const FAUCET_ADDRESS = process.env.FAUCET_ADDRESS;

  if (!RPC_URL || !FAUCET_ADDRESS) {
    logger.error('Missing required environment variables');
    process.exit(1);
  }

  logger.info('Config loaded:', { RPC_URL, FAUCET_ADDRESS });

  const eventLogger = new EventLogger(RPC_URL, FAUCET_ADDRESS);

  const app = express();

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
};

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
}); 