const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const result = await db.query(
      'INSERT INTO users (wallet_address) VALUES ($1) RETURNING *',
      [walletAddress]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new claim with rate limiting
router.post('/claims', async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;
    const CLAIM_WINDOW = 24; // hours
    const MAX_AMOUNT = 1000; // maximum tokens allowed in 24 hours
    
    // Check total claims in the last 24 hours
    const claimsResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total_claimed
       FROM claims c 
       JOIN users u ON c.user_id = u.id 
       WHERE u.wallet_address = $1 
       AND c.claimed_at > NOW() - INTERVAL '${CLAIM_WINDOW} HOURS'`,
      [walletAddress]
    );

    const totalClaimed = Number(claimsResult.rows[0].total_claimed);
    const requestAmount = Number(amount);
    
    if (totalClaimed + requestAmount > MAX_AMOUNT) {
      return res.status(400).json({ 
        error: 'Claim limit exceeded',
        totalClaimed,
        remainingAmount: Math.max(0, MAX_AMOUNT - totalClaimed)
      });
    }

    // Get or create user
    let userResult = await db.query(
      'SELECT id FROM users WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (userResult.rows.length === 0) {
      userResult = await db.query(
        'INSERT INTO users (wallet_address) VALUES ($1) RETURNING id',
        [walletAddress]
      );
    }

    const userId = userResult.rows[0].id;
    
    const claimResult = await db.query(
      'INSERT INTO claims (user_id, amount) VALUES ($1, $2) RETURNING *',
      [userId, requestAmount]
    );

    res.json({
      success: true,
      claim: claimResult.rows[0],
      totalClaimed: totalClaimed + requestAmount,
      remainingAmount: MAX_AMOUNT - (totalClaimed + requestAmount)
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's claims and check limits
router.get('/claims/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const CLAIM_WINDOW = 24; // hours
    const MAX_AMOUNT = 1000; // maximum tokens allowed in 24 hours
    
    const result = await db.query(
      `SELECT 
        COALESCE(SUM(amount), 0) as total_claimed,
        MIN(claimed_at) as first_claim,
        MAX(claimed_at) as last_claim
       FROM claims c 
       JOIN users u ON c.user_id = u.id 
       WHERE u.wallet_address = $1 
       AND c.claimed_at > NOW() - INTERVAL '${CLAIM_WINDOW} HOURS'`,
      [walletAddress]
    );
    
    const claimStats = result.rows[0] || { total_claimed: 0, first_claim: null, last_claim: null };
    const totalClaimed = Number(claimStats.total_claimed);
    const now = new Date();
    const windowStart = claimStats.first_claim ? new Date(claimStats.first_claim) : null;
    const windowEnd = windowStart ? new Date(windowStart.getTime() + (CLAIM_WINDOW * 60 * 60 * 1000)) : null;
    const timeRemaining = windowEnd ? Math.max(0, windowEnd.getTime() - now.getTime()) : 0;
    
    res.json({
      exists: true,
      claimStatus: {
        canClaim: totalClaimed < MAX_AMOUNT,
        withinWindow: Boolean(windowEnd && now < windowEnd),
        nextClaimTime: windowEnd,
        timeRemaining: timeRemaining,
      },
      limits: {
        maxAmount: MAX_AMOUNT,
        claimed: totalClaimed,
        remaining: Math.max(0, MAX_AMOUNT - totalClaimed),
        windowHours: CLAIM_WINDOW
      },
      lastClaim: claimStats.last_claim
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router; 