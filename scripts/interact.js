const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    // Your deployed contract addresses
    const tokenAddress = "0xA5B5F4156d131aae519827F9FA87b7043f282f51";
    const faucetAddress = "0x83C6a23EeD9AAe46c7Cf40674Bb6452b7C09D6fA";
    
    // Get contract instances
    const testToken = await hre.ethers.getContractAt("TestToken", tokenAddress);
    const faucet = await hre.ethers.getContractAt("Faucet", faucetAddress);
    
    try {
        // Get token info
        const name = await testToken.name();
        const symbol = await testToken.symbol();
        const decimals = await testToken.decimals();
        console.log(`Token Info: ${name} (${symbol}) - ${decimals} decimals`);
        
        // Check balances
        const [signer] = await hre.ethers.getSigners();
        console.log("Signer address:", signer.address);
        
        // Check initial balances
        const initialBalance = await testToken.balanceOf(signer.address);
        const initialFaucetBalance = await testToken.balanceOf(faucetAddress);
        console.log(`Initial wallet balance: ${initialBalance}`);
        console.log(`Initial faucet balance: ${initialFaucetBalance}`);

        // Calculate transfer amount (1/10 of 1 million tokens)
        const transferAmount = ethers.parseUnits("100000", 18); // 100,000 tokens with 18 decimals
        
        console.log(`Transferring ${ethers.formatUnits(transferAmount, 18)} tokens to faucet...`);
        const tx = await testToken.transfer(faucetAddress, transferAmount);
        console.log("Waiting for transaction to be mined...");
        await tx.wait();
        console.log("Transfer complete!");

        // Check final balances
        const finalBalance = await testToken.balanceOf(signer.address);
        const finalFaucetBalance = await testToken.balanceOf(faucetAddress);
        console.log(`Final wallet balance: ${finalBalance}`);
        console.log(`Final faucet balance: ${finalFaucetBalance}`);
    } catch (error) {
        console.error("Error:", error.message);
        // Log more detailed error if available
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