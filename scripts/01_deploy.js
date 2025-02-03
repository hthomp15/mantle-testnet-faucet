const hre = require("hardhat");
const { ethers } = require("hardhat");

async function deployWithRetry(contractFactory, ...args) {
    const maxAttempts = 5;
    let lastError;
    
    for (let i = 0; i < maxAttempts; i++) {
        try {
            // Get the latest nonce before each attempt
            const [deployer] = await ethers.getSigners();
            const nonce = await deployer.getNonce();
            
            const contract = await contractFactory.deploy(...args, { nonce });
            await contract.waitForDeployment();
            return contract;
        } catch (error) {
            console.log(`Attempt ${i + 1} failed, retrying...`);
            lastError = error;
            // Wait for a few seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    throw lastError;
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Starting deployment...");
    console.log("Deployer address:", deployer.address);

    // Deploy TestToken with retry
    const TestToken = await ethers.getContractFactory("TestToken");
    const testToken = await deployWithRetry(TestToken);
    const tokenAddress = await testToken.getAddress();
    console.log(`TestToken deployed to: ${tokenAddress}`);

    // Deploy Faucet with retry
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await deployWithRetry(Faucet, tokenAddress, deployer.address);
    const faucetAddress = await faucet.getAddress();
    console.log(`Faucet deployed to: ${faucetAddress}`);

    console.log("\nDeployment complete! Contract addresses:");
    console.log("----------------------------------------");
    console.log("TestToken:", tokenAddress);
    console.log("Faucet:", faucetAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 