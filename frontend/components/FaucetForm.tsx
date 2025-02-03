import { useState, memo } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Timer } from './Timer';
import type { ClaimStatus } from '../lib/api';

interface FaucetFormProps {
  account: string;
  tokenBalance: string;
  claimStatus: ClaimStatus | null;
  loading: boolean;
  isWrongChain: boolean;
  onRequestTokens: (amount: number) => Promise<void>;
}

export const FaucetForm = memo(function FaucetForm({
  account,
  tokenBalance,
  claimStatus,
  loading,
  isWrongChain,
  onRequestTokens,
}: FaucetFormProps) {
  const [amount, setAmount] = useState<number | ''>(100);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const maxAmount = claimStatus?.limits.remaining ?? 1000;

  const handleClaimClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    
    try {
      if (!amount || amount < 1) {
        throw new Error('Please enter a valid amount');
      }
      
      await onRequestTokens(Number(amount));
      setSuccessMessage(`Successfully claimed ${amount} TFIDE tokens! 🎉`);
    } catch (error: any) {
      console.error('Error claiming tokens:', error);
    }
  };

  return (
    <form className="space-y-4">
      <div className="text-center space-y-2">
        {claimStatus?.claimStatus.nextClaimTime && (
          <Timer 
            timeRemaining={claimStatus.claimStatus.timeRemaining}
          />
        )}
        <p className="text-sm">Balance: {tokenBalance} TFIDE</p>
        {claimStatus && (
          <p className="text-sm">Available to claim: {claimStatus.limits.remaining} TFIDE</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="amount" className="text-sm text-gray-300">
            Enter amount to claim:
          </label>
          <input
            id="amount"
            type="number"
            min={1}
            max={claimStatus?.limits.remaining ?? 1000}
            value={amount}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (inputValue === '') {
                setAmount('' as any);
              } else {
                const value = Number(inputValue);
                const max = claimStatus?.limits.remaining ?? 1000;
                if (!isNaN(value)) {
                  setAmount(Math.min(value, max));
                }
              }
            }}
            className="bg-gray-700 text-white rounded px-3 py-2"
          />
        </div>

        <button
          type="button"
          onClick={handleClaimClick}
          disabled={
            loading || 
            !claimStatus?.claimStatus.canClaim || 
            isWrongChain || 
            !amount || 
            amount < 1 || 
            amount > maxAmount
          }
          className={`
            w-full py-2 px-4 rounded font-bold transition-colors
            ${loading || !claimStatus?.claimStatus.canClaim || isWrongChain || !amount || amount < 1 || amount > maxAmount
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
        {/* Would like to clean up the conditional logic here */}
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              <span>Requesting...</span>
            </div>
          ) : isWrongChain ? (
            'Wrong Network'
          ) : !claimStatus?.claimStatus.canClaim ? (
            'No tokens available'
          ) : (
            `Claim ${amount} TFIDE`
          )}
        </button>
      </div>

      {successMessage && (
        <div className="mt-4 p-3 bg-green-600/20 border border-green-600 rounded text-sm flex items-center justify-center space-x-2">
          <svg 
            className="w-5 h-5 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}
    </form>
  );
}); 