const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'https://mantle-testnet-faucet.vercel.app',
    'http://localhost:3000'
  ]
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