// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Faucet is ReentrancyGuard, AccessControl {
    IERC20 public token;
    uint256 public maxAmount = 1000 * 10**18; // 1000 tokens max per window
    uint256 public cooldownTime = 24 hours;
    uint256 public lowBalanceThreshold = 10000 * 10**18; // 10,000 tokens
    address public tokenAdmin;
    
    bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");

    bool public paused;
    
    struct UserClaims {
        uint256 lastClaimTime;
        uint256 totalClaimed;
    }
    
    mapping(address => UserClaims) public userClaims;
    
    event TokensClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 windowTotal
    );
    event LowBalance(
        uint256 currentBalance,
        uint256 threshold,
        uint256 timestamp
    );
    event FaucetPaused(address indexed by);
    event FaucetUnpaused(address indexed by);
    event TokensReceived(address indexed from, uint256 amount);

    constructor(address _tokenAddress, address _tokenAdmin) {
        token = IERC20(_tokenAddress);
        tokenAdmin = _tokenAdmin;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(WITHDRAWER_ROLE, msg.sender);
        paused = false;
    }

    function canClaim(address user) public view returns (
        bool allowed,
        uint256 remaining,
        uint256 nextClaimTime
    ) {
        UserClaims memory claims = userClaims[user];
        
        // If first claim or window has passed, reset tracking
        if (claims.lastClaimTime + cooldownTime < block.timestamp) {
            return (true, maxAmount, 0);
        }

        uint256 remainingAmount = maxAmount - claims.totalClaimed;
        return (
            remainingAmount > 0,
            remainingAmount,
            claims.lastClaimTime + cooldownTime
        );
    }

    function requestTokens(uint256 amount) external nonReentrant {
        require(!paused, "Faucet is paused");
        require(amount > 0, "Amount must be greater than 0");
        
        (bool allowed, uint256 remaining, ) = canClaim(msg.sender);
        require(allowed, "Cannot claim at this time");
        require(amount <= remaining, "Amount exceeds remaining allowance");

        uint256 faucetBalance = token.balanceOf(address(this));
        require(faucetBalance >= amount, "Insufficient tokens in faucet");

        // Check if balance will be low after this transfer
        if (faucetBalance - amount < lowBalanceThreshold) {
            emit LowBalance(
                faucetBalance - amount,
                lowBalanceThreshold,
                block.timestamp
            );
        }

        // Update user claims
        UserClaims storage claims = userClaims[msg.sender];
        uint256 newWindowTotal;
        if (claims.lastClaimTime + cooldownTime < block.timestamp) {
            // Reset if window has passed - this is a fresh claim
            newWindowTotal = amount;
            claims.totalClaimed = amount;
            claims.lastClaimTime = block.timestamp;  // Set time only for fresh claims
        } else {
            // Within existing window - don't update the time
            newWindowTotal = claims.totalClaimed + amount;
            claims.totalClaimed = newWindowTotal;
        }

        // Transfer tokens
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        
        // Emit claim event
        emit TokensClaimed(
            msg.sender,
            amount,
            block.timestamp,
            newWindowTotal
        );
    }

    function withdrawTokens(uint256 amount) external onlyRole(WITHDRAWER_ROLE) {
        require(
            token.balanceOf(address(this)) >= amount,
            "Insufficient balance to withdraw"
        );
        require(token.transfer(msg.sender, amount), "Token transfer failed");
    }

    // Function to receive tokens from admin
    function receiveTokens(uint256 amount) external {
        require(
            msg.sender == tokenAdmin,
            "Only token admin can send tokens"
        );
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        emit TokensReceived(msg.sender, amount);
    }

    function setMaxAmount(uint256 _maxAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxAmount = _maxAmount;
    }

    function setCooldownTime(uint256 _cooldownTime) external onlyRole(DEFAULT_ADMIN_ROLE) {
        cooldownTime = _cooldownTime;
    }

    function setLowBalanceThreshold(uint256 _threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        lowBalanceThreshold = _threshold;
    }

    function setTokenAdmin(address _tokenAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenAdmin = _tokenAdmin;
    }

    function pauseFaucet() external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = true;
        emit FaucetPaused(msg.sender);
    }

    function unpauseFaucet() external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = false;
        emit FaucetUnpaused(msg.sender);
    }
}