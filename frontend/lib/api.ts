const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export type ClaimStatus = {
  exists: boolean;
  claimStatus: {
    canClaim: boolean;
    withinWindow: boolean;
    nextClaimTime: string | null;
    timeRemaining: number;
  };
  limits: {
    maxAmount: number;
    claimed: number;
    remaining: number;
    windowHours: number;
  };
  lastClaim: string | null;
};

export const api = {
  checkStatus: async (walletAddress: string): Promise<ClaimStatus> => {
    const res = await fetch(`${API_URL}/api/claims/${walletAddress}`);
    if (!res.ok) throw new Error('Failed to fetch status');
    return res.json();
  },

  claim: async (walletAddress: string, amount: number) => {
    console.log('Claiming with data:', { walletAddress, amount });
    
    const res = await fetch(`${API_URL}/api/claims`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ walletAddress, amount })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('Claim error response:', errorData);
      throw new Error(errorData.message || 'Failed to claim');
    }
    return res.json();
  }
}; 