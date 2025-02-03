require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
      },
      {
        version: "0.8.20",
      },
      {
        version: "0.8.19",
      }
    ],
  },
    defaultNetwork: "mantleSepolia", // chosen by default when network isn't specified while running Hardhat
    networks: {
        mantle: {
            url: "https://rpc.mantle.xyz", //mainnet
            accounts: [process.env.ACCOUNT_PRIVATE_KEY ?? ""],
        },
        mantleSepolia: {
            url: "https://rpc.sepolia.mantle.xyz", // Sepolia Testnet
            accounts: [process.env.ACCOUNT_PRIVATE_KEY ?? ""],
            chainId: 5003,
            verifyURL: 'https://explorer.sepolia.mantle.xyz/api' // Add verification URL
        },
    },
    etherscan: {
        apiKey: {
            mantleSepolia: process.env.MANTLESCAN_API_KEY
        },
        customChains: [
            {
                network: "mantleSepolia",
                chainId: 5003,
                urls: {
                    apiURL: "https://explorer.sepolia.mantle.xyz/api",
                    browserURL: "https://explorer.sepolia.mantle.xyz"
                }
            }
        ]
    },
    sourcify: {
        enabled: true
    }
};
