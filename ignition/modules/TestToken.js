const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TestToken", (m) => {
    const token = m.contract("TestToken");
    return { token };
}); 