# Mantle Faucet Frontend

A Next.js application for requesting test tokens on Mantle Sepolia testnet.

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# Contract Addresses
NEXT_PUBLIC_TOKEN_ADDRESS=0x...  # Token contract address
NEXT_PUBLIC_FAUCET_ADDRESS=0x... # Faucet contract address

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001 # Backend API URL

# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key # Google reCAPTCHA v2 site key
```

## Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser

## Building for Production

1. Build the application:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm start
# or
yarn start
```

## Deployment

When deploying to production:

1. Set up environment variables on your hosting platform
2. Ensure the following environment variables are configured:
   - `NEXT_PUBLIC_TOKEN_ADDRESS`
   - `NEXT_PUBLIC_FAUCET_ADDRESS`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
3. Deploy using your preferred hosting service (Vercel recommended)

## Network Configuration

The application is configured to work with Mantle Sepolia testnet. Users will need:

1. MetaMask or compatible Web3 wallet
2. Connection to Mantle Sepolia network
3. MNT tokens for gas fees

## Learn More

- [Mantle Network Documentation](https://docs.mantle.xyz)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
