// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TestToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    event TokensMinted(
        address indexed to,
        uint256 amount,
        address indexed by,
        uint256 timestamp
    );

    constructor() ERC20("Test TIDE", "TFIDE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Initial supply minted to deployer
        uint256 initialSupply = 100000000 * 10 ** decimals();
        _mint(msg.sender, initialSupply);
        emit TokensMinted(msg.sender, initialSupply, msg.sender, block.timestamp);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit TokensMinted(to, amount, msg.sender, block.timestamp);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
} 