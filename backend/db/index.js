const { Pool } = require('pg');
require('dotenv').config();

const isDevelopment = process.env.NODE_ENV !== 'production';

const pool = isDevelopment ? 
  // Development configuration 
  new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  }) :
  // Production configuration using connection string (Railway)
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

// Simple connection test
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log(`Database connected successfully in ${isDevelopment ? 'development' : 'production'} mode`);
  }
});

module.exports = {
  query: async (text, params) => {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  },
  pool
}; 