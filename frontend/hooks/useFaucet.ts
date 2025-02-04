import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { api } from '../lib/api';
import TokenABI from '../contracts/TestToken.json';
import FaucetABI from '../contracts/Faucet.json';
import type { ClaimStatus } from '../lib/api';

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as string;
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS as string;

interface FaucetError extends Error {
  data?: { message?: string; };
}

export function useFaucet(account: string) {
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkClaimStatus = useCallback(async (userAddress: string): Promise<void> => {
    if (!userAddress) return;
    console.log('Checking claim status for:', userAddress);
    try {
      const status = await api.checkStatus(userAddress);
      setClaimStatus(status);
    } catch (err) {
      console.error('Error checking claim status:', err);
    }
  }, []);

  const updateTokenBalance = useCallback(async (userAddress: string): Promise<void> => {
    if (!userAddress || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = new ethers.Contract(
        TOKEN_ADDRESS,
        TokenABI.abi,
        provider
      );

      // Normalize the address to ensure it's valid
      const normalizedAddress = ethers.getAddress(userAddress); // This will throw if the address is invalid

      const balance = await token.balanceOf(normalizedAddress);
      setTokenBalance(ethers.formatUnits(balance, 18));
    } catch (err) {
      console.error('Error updating balance:', err);
    }
  }, []);

  const requestTokens = useCallback(async (amount: number): Promise<void> => {
    if (!account || !window.ethereum) {
      throw new Error('Please connect your wallet!');
    }

    setLoading(true);
    try {
      // First check with backend if claim is allowed
      await api.claim(account, amount);
      
      // Then make the blockchain transaction
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const faucet = new ethers.Contract(
        FAUCET_ADDRESS,
        FaucetABI.abi,
        signer
      );

      // Convert amount to wei before sending to contract
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      const tx = await faucet.requestTokens(amountWei);
      await tx.wait();
      
      // Update status and balance after successful claim
      await Promise.all([
        checkClaimStatus(account),
        updateTokenBalance(account)
      ]);
    } catch (err) {
      const error = err as FaucetError;
      const errorMessage = error.data?.message || error.message || 'Failed to request tokens';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [account, checkClaimStatus, updateTokenBalance]);

  // Initialize and handle account changes
  useEffect(() => {
    if (account) {
      const initializeAccount = async () => {
        await Promise.all([
          updateTokenBalance(account),
          checkClaimStatus(account)
        ]);
      };
      
      initializeAccount();
    } else {
      setTokenBalance('0');
      setClaimStatus(null);
    }
  }, [account, updateTokenBalance, checkClaimStatus]);

  return {
    tokenBalance,
    claimStatus,
    loading,
    checkClaimStatus,
    updateTokenBalance,
    requestTokens
  };
} 