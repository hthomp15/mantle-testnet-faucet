const { ethers } = require('ethers');

const validateWalletAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

const validateAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

module.exports = {
  validateUserInput: (req, res, next) => {
    const { walletAddress } = req.body;
    
    if (!walletAddress || !validateWalletAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    
    next();
  },

  validateClaimInput: (req, res, next) => {
    const { walletAddress, amount } = req.body;
    
    if (!walletAddress || !validateWalletAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    
    if (!amount || !validateAmount(amount)) {
      return res.status(400).json({ error: 'Amount must be a positive integer' });
    }
    
    next();
  }
}; 