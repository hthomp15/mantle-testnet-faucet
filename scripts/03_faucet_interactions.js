const hre = require("hardhat");
const { ethers } = require("hardhat");

// Update these addresses after deployment
const TOKEN_ADDRESS = "YOUR_TOKEN_ADDRESS";
const FAUCET_ADDRESS = "YOUR_FAUCET_ADDRESS";

async function main() {
    const testToken = await hre.ethers.getContractAt("TestToken", TOKEN_ADDRESS);
    const faucet = await hre.ethers.getContractAt("Faucet", FAUCET_ADDRESS);
    const [signer] = await hre.ethers.getSigners();

    try {
        console.log("Faucet Interaction Examples");
        console.log("==========================");

        // 1. Get current faucet settings
        const maxAmount = await faucet.maxAmount();
        const cooldownTime = await faucet.cooldownTime();
        console.log(`\nCurrent Settings:`);
        console.log(`Max amount per window: ${ethers.formatUnits(maxAmount, 18)} tokens`);
        console.log(`Cooldown time: ${cooldownTime / 3600} hours`);

        // 2. Check claim status
        const [allowed, remaining, nextClaimTime] = await faucet.canClaim(signer.address);
        console.log("\nClaim Status:");
        console.log(`Can claim: ${allowed}`);
        console.log(`Remaining amount: ${ethers.formatUnits(remaining, 18)} tokens`);
        console.log(`Next claim time: ${nextClaimTime > 0 ? new Date(nextClaimTime * 1000).toLocaleString() : 'Now'}`);

        // 3. Request tokens
        if (allowed) {
            console.log("\nRequesting tokens...");
            const amount = ethers.parseUnits("100", 18); // Request 100 tokens
            const requestTx = await faucet.requestTokens(amount);
            await requestTx.wait();
            console.log("Token request successful!");
        }

        // 4. Check balances
        const userBalance = await testToken.balanceOf(signer.address);
        const faucetBalance = await testToken.balanceOf(FAUCET_ADDRESS);
        console.log(`\nBalances:`);
        console.log(`Your balance: ${ethers.formatUnits(userBalance, 18)} tokens`);
        console.log(`Faucet balance: ${ethers.formatUnits(faucetBalance, 18)} tokens`);

    } catch (error) {
        console.error("Error:", error.message);
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