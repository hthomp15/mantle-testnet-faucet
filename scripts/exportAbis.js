const fs = require('fs');
const path = require('path');

async function main() {
    // Create frontend/contracts directory if it doesn't exist
    const contractsDir = path.join(__dirname, '../frontend/contracts');
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Export Faucet ABI
    const Faucet = artifacts.readArtifactSync("Faucet");
    fs.writeFileSync(
        path.join(contractsDir, 'Faucet.json'),
        JSON.stringify({ abi: Faucet.abi }, null, 2)
    );

    // Export TestToken ABI
    const TestToken = artifacts.readArtifactSync("TestToken");
    fs.writeFileSync(
        path.join(contractsDir, 'TestToken.json'),
        JSON.stringify({ abi: TestToken.abi }, null, 2)
    );

    console.log("📝 ABIs exported to frontend/contracts/");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 