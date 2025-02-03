# Mantle Faucet Backend

Express.js server that monitors faucet contract events and provides API endpoints for the frontend.

## Features

- Event monitoring for faucet contract
- Winston logging system
- Rate limiting for API endpoints
- User claim tracking

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# Server Configuration
PORT=5001

# Network Configuration
RPC_URL=https://rpc.sepolia.mantle.xyz
FAUCET_ADDRESS=0x...  # Faucet contract address

# CORS Configuration (for development)
FRONTEND_URL=http://localhost:3000
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Start production server:
```bash
npm start
```

## API Endpoints

### User Management
```
POST /api/user
- Create or update user record
- Body: { walletAddress: string }
```

### Faucet Usage
```
POST /api/claim
- Request tokens from the faucet
- Body: { address: string }
- Response: { success: boolean, message: string, txHash?: string }

GET /api/claims/:address
- Get user's claim history and eligibility
- Response: {
    lastClaim: Date | null,
    isEligible: boolean,
    cooldownRemaining?: number  // Time in seconds until next eligible claim
  }
```

## Event Monitoring

The backend monitors the following contract events:
- TokensRequested
- TokensClaimed
- LowBalance

Events are logged to:
- `/logs/combined.log` - All logs
- `/logs/error.log` - Error logs only

## Error Handling

Errors are logged with the following levels:
- `error`: Contract and server errors
- `warn`: Low balance alerts
- `info`: General operations and successful claims

## Development

1. Run with nodemon for auto-reloading:
```bash
npm run dev
```

2. Check logs:
```bash
tail -f logs/combined.log
```

## Production Deployment

1. Set production environment variables
2. Build and start:
```bash
npm run build
npm start
```

## Dependencies

- express: Web server framework
- ethers: Ethereum library
- winston: Logging
- cors: Cross-origin resource sharing
- dotenv: Environment variable management

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 