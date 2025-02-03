const hre = require("hardhat");
const { ethers } = require("hardhat");

// Update these addresses after deployment
const TOKEN_ADDRESS = "0xA9600240C903e8A50D3F3C7fc33a9aA2C24B862e";
const FAUCET_ADDRESS = "0xb903429AF0AC8154CB19c1A2D4f9D5D3244ddebb";

async function main() {
    const testToken = await hre.ethers.getContractAt("TestToken", TOKEN_ADDRESS);
    const faucet = await hre.ethers.getContractAt("Faucet", FAUCET_ADDRESS);
    
    try {
        console.log("Starting faucet setup...");
        
        // 1. Transfer initial tokens to Faucet
        const transferAmount = ethers.parseUnits("9900000", 18);
        console.log(`\nTransferring ${ethers.formatUnits(transferAmount, 18)} tokens to faucet...`);
        
        // First approve the transfer
        const approveTx = await testToken.approve(FAUCET_ADDRESS, transferAmount);
        await approveTx.wait();
        console.log("Approved faucet to receive tokens");

        // Then call receiveTokens
        const receiveTx = await faucet.receiveTokens(transferAmount);
        await receiveTx.wait();
        console.log("Initial tokens transferred to faucet");

        // 2. Verify setup
        const faucetBalance = await testToken.balanceOf(FAUCET_ADDRESS);
        console.log(`\nSetup complete! Faucet balance: ${ethers.formatUnits(faucetBalance, 18)} tokens`);

    } catch (error) {
        console.error("Error during setup:", error.message);
        if (error.error) {
            console.error("Detailed error:", error.error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 