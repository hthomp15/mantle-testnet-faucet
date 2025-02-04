const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Starting deployment...");
  console.log("Deployer address:", deployer.address);

  // Deploy TestToken
  console.log("Deploying TestToken...");
  const TestToken = await ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();
  await testToken.waitForDeployment();
  const tokenAddress = await testToken.getAddress();
  console.log(`TestToken deployed to: ${tokenAddress}`);

  // Deploy Faucet with token address and deployer as admin
  console.log("Deploying Faucet...");
  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy(tokenAddress, deployer.address);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log(`Faucet deployed to: ${faucetAddress}`);

  // Fund the faucet
  console.log("\nFunding the faucet...");
  const fundAmount = ethers.parseUnits("10000000", 18); // 10 million tokens
  
  // First approve the faucet to receive tokens
  console.log("Approving tokens...");
  const approveTx = await testToken.approve(faucetAddress, fundAmount);
  await approveTx.wait();
  console.log("Tokens approved");

  // Then call receiveTokens
  console.log("Transferring tokens to faucet...");
  const faucetContract = await ethers.getContractAt("Faucet", faucetAddress);
  const receiveTx = await faucetContract.receiveTokens(fundAmount);
  await receiveTx.wait();
  
  // Verify the balance
  const balance = await testToken.balanceOf(faucetAddress);
  console.log(`Faucet funded with ${ethers.formatUnits(balance, 18)} tokens`);

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