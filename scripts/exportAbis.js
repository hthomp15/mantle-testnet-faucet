const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    // Create frontend/contracts directory if it doesn't exist
    const contractsDir = path.join(__dirname, '../frontend/contracts');
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Export Faucet ABI and address
    const Faucet = await hre.artifacts.readArtifact("Faucet");
    fs.writeFileSync(
        path.join(contractsDir, 'Faucet.json'),
        JSON.stringify(Faucet, null, 2)
    );

    // Export TestToken ABI and address
    const TestToken = await hre.artifacts.readArtifact("TestToken");
    fs.writeFileSync(
        path.join(contractsDir, 'TestToken.json'),
        JSON.stringify(TestToken, null, 2)
    );

    console.log("📝 Contract artifacts exported to frontend/contracts/");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 