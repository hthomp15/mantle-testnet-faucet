const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const { EventLogger } = require('./services/eventLogger');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(express.json());

app.use(cors({
  origin: [
    `${process.env.PRODUCTION_URL}`,
    `${process.env.DEVELOPMENT_URL}`
  ],
  methods: ['GET', 'POST'],
  credentials: true 
}));

// Event logger
const eventLogger = new EventLogger(process.env.RPC_URL, process.env.FAUCET_ADDRESS);
eventLogger.startListening().then(() => {
  console.log('Event logger started');
}).catch((error) => {
  console.error('Error starting event logger:', error);
});

// Routes
app.use('/api', usersRouter);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 