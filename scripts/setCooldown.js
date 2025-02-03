const hre = require("hardhat");

async function main() {
  // Get the deployed faucet contract address
  const FAUCET_ADDRESS = "0x83C6a23EeD9AAe46c7Cf40674Bb6452b7C09D6fA";
  
  // Get the Faucet contract factory
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  
  // Attach to the deployed contract
  const faucet = Faucet.attach(FAUCET_ADDRESS);
  
  // Set cooldown to 60 seconds (1 minute)
  const tx = await faucet.setCooldownTime(60);
  await tx.wait();
  
  console.log("Cooldown time set to 1 minute!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 