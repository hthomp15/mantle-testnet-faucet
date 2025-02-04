const hre = require("hardhat");
const { ethers } = require("hardhat");

// Contract addresses - update these after deployment
const FAUCET_ADDRESS = "your_faucet_address";
const TOKEN_ADDRESS = "your_token_address";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Interacting with contracts using:", deployer.address);

    // Get contract instances
    const faucet = await ethers.getContractAt("Faucet", FAUCET_ADDRESS);
    const token = await ethers.getContractAt("TestToken", TOKEN_ADDRESS);

    // Helper to format token amounts
    const formatTokens = (amount) => ethers.formatUnits(amount, 18);

    async function displayFaucetInfo() {
        console.log("\nFaucet Information:");
        console.log("------------------");
        const maxAmount = await faucet.maxAmount();
        const cooldownTime = await faucet.cooldownTime();
        const lowBalanceThreshold = await faucet.lowBalanceThreshold();
        const balance = await token.balanceOf(FAUCET_ADDRESS);
        const paused = await faucet.paused();
        const tokenAdmin = await faucet.tokenAdmin();

        console.log(`Max Amount: ${formatTokens(maxAmount)} TFIDE`);
        console.log(`Cooldown Time: ${cooldownTime / 3600} hours`);
        console.log(`Low Balance Threshold: ${formatTokens(lowBalanceThreshold)} TFIDE`);
        console.log(`Current Balance: ${formatTokens(balance)} TFIDE`);
        console.log(`Paused: ${paused}`);
        console.log(`Token Admin: ${tokenAdmin}`);
    }

    async function checkUserStatus(address) {
        console.log("\nUser Status for:", address);
        console.log("------------------");
        const [allowed, remaining, nextClaimTime] = await faucet.canClaim(address);
        const claims = await faucet.userClaims(address);

        console.log(`Can Claim: ${allowed}`);
        console.log(`Remaining Amount: ${formatTokens(remaining)} TFIDE`);
        console.log(`Next Claim Time: ${new Date(Number(nextClaimTime) * 1000).toLocaleString()}`);
        console.log(`Last Claim Time: ${new Date(Number(claims.lastClaimTime) * 1000).toLocaleString()}`);
        console.log(`Total Claimed: ${formatTokens(claims.totalClaimed)} TFIDE`);
    }

    async function requestTokens(amount) {
        console.log("\nRequesting Tokens:");
        console.log("------------------");
        const tx = await faucet.requestTokens(ethers.parseUnits(amount.toString(), 18));
        console.log("Transaction hash:", tx.hash);
        await tx.wait();
        console.log("Tokens claimed successfully!");
    }

    async function adminFunctions() {
        if (!(await faucet.hasRole(ethers.ZeroHash, deployer.address))) {
            console.log("Not an admin, skipping admin functions");
            return;
        }

        console.log("\nAdmin Functions:");
        console.log("---------------");

        // Set new max amount
        const newMaxAmount = ethers.parseUnits("200", 18);
        await faucet.setMaxAmount(newMaxAmount);
        console.log("Max amount updated to 200 TFIDE");

        // Set new cooldown time
        const newCooldown = 12 * 3600; // 12 hours
        await faucet.setCooldownTime(newCooldown);
        console.log("Cooldown time updated to 12 hours");

        // Set new low balance threshold
        const newThreshold = ethers.parseUnits("5000", 18);
        await faucet.setLowBalanceThreshold(newThreshold);
        console.log("Low balance threshold updated to 5000 TFIDE");

        // Pause/unpause faucet
        await faucet.pauseFaucet();
        console.log("Faucet paused");
        await faucet.unpauseFaucet();
        console.log("Faucet unpaused");
    }

    // Execute functions
    try {
        await displayFaucetInfo();
        await checkUserStatus(deployer.address);
        
        // Uncomment to execute these functions:
        // await requestTokens(100);
        // await adminFunctions();
        
        // Display updated info
        await displayFaucetInfo();
        await checkUserStatus(deployer.address);
    } catch (error) {
        console.error("Error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 