const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Faucet", (m) => {
    // Deploy TestToken first without arguments
    const token = m.contract("TestToken");
    
    // Deploy Faucet with TestToken address
    const faucet = m.contract("Faucet", [token]);
    
    return { token, faucet };
}); 