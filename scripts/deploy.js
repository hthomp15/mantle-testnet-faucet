const { ethers } = require("hardhat");

async function main() {
  // Deploy TestToken
  const TestToken = await ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();
  await testToken.deployed();
  console.log("TestToken deployed to:", testToken.address);

  // Deploy Faucet
  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy(testToken.address);
  await faucet.deployed();
  console.log("Faucet deployed to:", faucet.address);

  // Transfer some tokens to the faucet
  const transferAmount = ethers.utils.parseEther("10000");
  await testToken.transfer(faucet.address, transferAmount);
  console.log("Transferred tokens to faucet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 