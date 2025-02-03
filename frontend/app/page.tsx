'use client';

import { useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useFaucet } from '../hooks/useFaucet';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Header } from '../components/Header';
import { FAQ } from '../components/FAQ';
import { FaucetForm } from '../components/FaucetForm';

export default function Home() {
  const { 
    account, 
    loading: walletLoading, 
    error: walletError,
    isWrongChain,
    connectWallet, 
    disconnectWallet,
    mounted 
  } = useWallet();

  const { 
    tokenBalance, 
    claimStatus,
    loading: faucetLoading,
    requestTokens,
  } = useFaucet(account);

  const handleRequestTokens = useCallback(async (amount: number) => {
    await requestTokens(amount);
  }, [requestTokens]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header 
        account={account}
        loading={walletLoading}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        isWrongChain={isWrongChain}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Mantle Testnet Faucet</h2>
          
          <div className="mb-6 text-sm text-gray-400">
            <p className="mb-2">Request TFIDE tokens for Mantle Sepolia testnet.</p>
            <p>You can request up to {claimStatus?.limits.maxAmount ?? 1000} TFIDE tokens every {claimStatus?.limits.windowHours ?? 24} hours.</p>
          </div>
          
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={walletLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {walletLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  <span>Connecting...</span>
                </div>
              ) : (
                'Connect Wallet'
              )}
            </button>
          ) : (
            <FaucetForm
              account={account}
              tokenBalance={tokenBalance}
              claimStatus={claimStatus}
              loading={faucetLoading}
              isWrongChain={isWrongChain}
              onRequestTokens={handleRequestTokens}
            />
          )}

          {walletError && (
            <div className="mt-4 p-3 bg-red-600/20 border border-red-600 rounded text-sm">
              {walletError}
            </div>
          )}
        </div>

        <FAQ />
      </div>
    </div>
  );
}
