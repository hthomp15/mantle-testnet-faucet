const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  console.log(`Created logs directory at: ${logsDir}`);
}

// Custom format for detailed logging
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
    }
    return msg;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: 'debug', // Set to debug to see more logs
  format: logFormat,
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // File transports with explicit file creation
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      options: { flags: 'a' }
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      options: { flags: 'a' }
    })
  ]
});

// Test the logger immediately
logger.info('Logger initialized');
logger.error('Test error message');

// Log the paths where files are being written
console.log('Log files will be written to:');
console.log(`- ${path.join(logsDir, 'error.log')}`);
console.log(`- ${path.join(logsDir, 'combined.log')}`);

// Export the logger
module.exports = { logger }; 