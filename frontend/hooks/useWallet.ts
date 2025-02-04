import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider } from "ethers";
import { MANTLE_SEPOLIA } from "../config/networks";
import { api } from "../lib/api";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [account, setAccount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isWrongChain, setIsWrongChain] = useState<boolean>(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize provider after component is mounted
  useEffect(() => {
    if (mounted && typeof window !== 'undefined' && window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    }
  }, [mounted]);

  const checkChain = useCallback(async (): Promise<boolean> => {
    if (!mounted || !provider) return false;
    
    try {
      const network = await provider.getNetwork();
      const isCorrectChain = network.chainId === BigInt(MANTLE_SEPOLIA.id);
      setIsWrongChain(!isCorrectChain);
      return isCorrectChain;
    } catch (error) {
      console.error("Error checking chain:", error);
      return false;
    }
  }, [provider, mounted]);

  const checkConnection = useCallback(async () => {
    if (!mounted || !provider) return;

    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress()
      const normalizedAddress = address.toLowerCase();
      setAccount(normalizedAddress);
      await checkChain();
    } catch (error) {
      console.error("Error checking initial connection:", error);
    }
  }, [provider, checkChain, mounted]);

  // Check connection when provider is available
  useEffect(() => {
    if (!mounted) return;

    if (provider && localStorage.getItem("connectedWallet")) {
      checkConnection();
    }
  }, [provider, checkConnection, mounted]);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    console.log('Accounts changed:', accounts);
    if (accounts.length === 0) {
      setAccount("");
      setIsWrongChain(false);
      setError("");
    } else {
      const normalizedAccount = accounts[0].toLowerCase();
      setAccount(normalizedAccount);
      checkChain();
    }
  }, [checkChain]);

  const handleChainChanged = useCallback(async () => {
    try {
      if (window.ethereum) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);
        
        const network = await newProvider.getNetwork();
        const isCorrectChain = network.chainId === BigInt(MANTLE_SEPOLIA.id);
        setIsWrongChain(!isCorrectChain);

        // If we're on the correct chain, update the account info
        if (isCorrectChain) {
          const signer = await newProvider.getSigner();
          const address = await signer.getAddress();
          const normalizedAddress = address.toLowerCase();
          setAccount(normalizedAddress);
          setError('');
        }
      }
    } catch (error) {
      console.error('Error handling chain change:', error);
      setError('Failed to update network connection');
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!mounted) return () => {};

    // Define typed event handlers
    const onChainChanged = (_chainId: string) => {
      handleChainChanged();
    };

    const onAccountsChanged = (accounts: string[]) => {
      handleAccountsChanged(accounts);
    };

    if (window.ethereum) {
      window.ethereum.on("chainChanged", onChainChanged);
      window.ethereum.on("accountsChanged", onAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", onChainChanged);
        window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      }
    };
  }, [handleChainChanged, handleAccountsChanged, mounted]);

  const connectWallet = async () => {
    try {
      // Reinitialize provider if it's null
      if (!provider && window.ethereum) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);
      }

      if (!window.ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      setLoading(true);
      setError('');

      // Use the current provider or wait for the new one to be set
      const currentProvider = provider || new ethers.BrowserProvider(window.ethereum);
      const signer = await currentProvider.getSigner();
      const address = await signer.getAddress();
      const normalizedAddress = address.toLowerCase();
      console.log('Connected wallet address:', address);
      // Register user in our backend
      await api.registerUser(normalizedAddress);
      
      setAccount(normalizedAddress);
      localStorage.setItem("connectedWallet", "true");

      await checkChain();
      
      return normalizedAddress;
    } catch (error) {
      setError('Failed to connect wallet');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = useCallback(() => {
    setAccount('');
    setError('');
    setIsWrongChain(false);
    localStorage.removeItem("connectedWallet");
  }, []);

  return {
    account,
    loading,
    error,
    isWrongChain,
    provider,
    connectWallet,
    disconnectWallet,
    setError,
    mounted,
  };
}
