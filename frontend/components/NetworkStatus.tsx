import { memo } from 'react';

interface NetworkStatusProps {
  isWrongChain: boolean;
  onSwitchNetwork: () => Promise<void>;
}

export const NetworkStatus = memo(function NetworkStatus({
  isWrongChain,
  onSwitchNetwork
}: NetworkStatusProps) {
  if (!isWrongChain) return null;

  return (
    <div className="text-yellow-400 text-sm mb-4">
      <button 
        onClick={onSwitchNetwork}
        className="underline hover:text-yellow-300"
      >
        Switch to Mantle Sepolia Network
      </button>
    </div>
  );
}); 