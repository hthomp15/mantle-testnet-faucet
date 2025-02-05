# Mantle Faucet Backend

Express.js server that monitors faucet contract events and provides API endpoints for the frontend.

## Features

- Event monitoring for faucet contract
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
DEVELOPMENT_URL=http://localhost:3000

# Cors Configuration (Production)
PRODUCTION_URL=https://your-app.vercel.app
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
- TokensClaimed (for tracking user claims)
- LowBalance (alerting when the balance is low)
- FaucetPaused (alerting when the faucet is paused)
- FaucetUnpaused (alerting when the faucet is unpaused)
- TokensReceived (for funding the faucet)
  

Events are logged to:
- `/logs/combined.log` - All logs
- `/logs/error.log` - Error logs only

## Error Handling

Errors are logged with the following levels:
- `error`: Contract and server errors
- `warn`: Low balance alerts
- `info`: General operations and successful claims

## Development

1. Set up local database:
```bash
# Create PostgreSQL database
createdb your_local_db
```

2. Configure environment variables in `.env`:
```bash
# Database Configuration (Development)
POSTGRES_USER=your_local_user
POSTGRES_HOST=localhost
POSTGRES_DB=your_local_db
POSTGRES_PASSWORD=your_local_password
POSTGRES_PORT=5432

# Server Configuration
PORT=5001 # This is the port that the server will run on

# Network Configuration
RPC_URL=https://rpc.sepolia.mantle.xyz
FAUCET_ADDRESS=0x...  # Your deployed faucet contract address

# CORS Configuration
DEVELOPMENT_URL=http://localhost:3000 # Development frontend URL
PRODUCTION_URL=https://your-app.vercel.app  # Production frontend URL
```

3. Run migrations:
```bash
npm run migrate:dev
```

4. Start development server:
```bash
npm run dev
```

## Production Deployment

The backend is configured for Railway deployment:

1. Environment variables are automatically set:
   - `DATABASE_URL`: Provided by Railway
   - `NODE_ENV=production`: Set by Railway
   - `PRODUCTION_URL`: Your frontend's production URL

2. Deployment process:
```bash
# Railway automatically runs:
npm run build        # Installs dependencies
npm run postbuild    # Runs production migrations
npm run start        # Starts the server
```

3. Verify deployment:
   - Check Railway logs
   - Test API endpoints
   - Monitor database connections

## Dependencies

- express: Web server framework
- ethers: Ethereum library
- cors: Cross-origin resource sharing
- dotenv: Environment variable management

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 