# Mantle Token Faucet

A full-stack dApp for distributing test tokens on Mantle Sepolia testnet. The application includes smart contracts, a backend service for monitoring events, and a Next.js frontend interface.

## Project Structure

```
├── contracts/           # Solidity smart contracts
├── frontend/           # Next.js frontend application
├── backend/           # Express.js server for event monitoring
└── scripts/           # Deployment and utility scripts
```

## Smart Contracts

The project consists of two main contracts:
- `TestToken.sol`: ERC20 token contract for test tokens
- `Faucet.sol`: Manages token distribution with rate limiting

### Deployment

1. Set up environment variables in `.env`:
```bash
PRIVATE_KEY=your_private_key
MANTLE_SEPOLIA_RPC=https://rpc.sepolia.mantle.xyz
```

2. Install dependencies:
```bash
npm install
```

3. Deploy contracts:
```bash
# Deploy to Mantle Sepolia
npx hardhat run scripts/deploy.js --network mantleSepolia

# Export ContractABI to frontend/contracts
npx hardhat run scripts/exportAbis.js

# Verify contracts (optional)
npx hardhat verify --network mantleSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

4. Update contract addresses:
   - Copy the deployed contract addresses
   - Update frontend `.env.local` with new addresses
   - Update backend `.env` with new addresses

## Backend Service

See [backend/README.md](backend/README.md) for setup and configuration instructions.

## Frontend Application

The frontend provides a user interface for connecting wallets and requesting tokens. See [frontend/README.md](frontend/README.md) for setup instructions.

## Development

1. Start the backend:
```bash
cd backend
npm install
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Access the application at `http://localhost:3000`

## Testing

```bash
# Run contract tests
npx hardhat test

# Run contract coverage
npx hardhat coverage
```

## Network Details

- Network: Mantle Sepolia Testnet
- ChainID: 5003
- RPC URL: https://rpc.sepolia.mantle.xyz
- Explorer: https://sepolia.explorer.mantle.xyz

## Environment Variables

### Root
```bash
ACCOUNT_PRIVATE_KEY=your_private_key
MANTLE_TESTNET_RPC_URL=https://rpc.sepolia.mantle.xyz
```

### Frontend
See [frontend/README.md](frontend/README.md)

### Backend
See [backend/README.md](backend/README.md)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
