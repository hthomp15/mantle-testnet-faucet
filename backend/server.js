const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(express.json());

const DEVELOPMENT_URL = process.env.DEVELOPMENT_URL;
const PRODUCTION_URL = process.env.PRODUCTION_URL;

// Determine the allowed origin based on the environment
const allowedOrigins = process.env.NODE_ENV === 'production' ? [PRODUCTION_URL] : [DEVELOPMENT_URL];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true // Allow credentials if needed
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