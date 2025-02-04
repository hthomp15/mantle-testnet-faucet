const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_URL  // e.g., 'https://mantle-testnet-faucet.vercel.app'
    : process.env.DEVELOPMENT_URL    // e.g., 'http://localhost:3000'
}));

// Routes
app.use('/api', usersRouter);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 