const { ethers } = require('ethers');

const FAUCET_ABI = [
  "event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp, uint256 windowTotal)",
  "event LowBalance(uint256 currentBalance, uint256 threshold, uint256 timestamp)",
  "event FaucetPaused(address indexed by)",
  "event FaucetUnpaused(address indexed by)",
  "event TokensReceived(address indexed from, uint256 amount)"
];

class EventLogger {
  constructor(rpcUrl, faucetAddress) {
    console.log('Initializing EventLogger', {
      rpcUrl,
      faucetAddress
    });
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(faucetAddress, FAUCET_ABI, this.provider);
    this.isListening = false;
    this.lastBlockNumber = 0;
  }

  async startListening() {
    if (this.isListening) return;
    
    console.log('Setting up event polling...');

    try {
      // Get current block number
      this.lastBlockNumber = await this.provider.getBlockNumber();
      
      // Start polling for events
      this.pollInterval = setInterval(async () => {
        try {
          const currentBlock = await this.provider.getBlockNumber();
          
          if (currentBlock > this.lastBlockNumber) {
            const events = await this.contract.queryFilter('*', this.lastBlockNumber + 1, currentBlock);
            
            for (const event of events) {
              if (event.fragment.name === 'TokensClaimed') {
                console.log('Tokens Claimed', {
                  user: event.args[0],
                  amount: event.args[1].toString(),
                  timestamp: new Date(Number(event.args[2]) * 1000).toISOString(),
                  windowTotal: event.args[3].toString(),
                  transactionHash: event.transactionHash
                });
              } else if (event.fragment.name === 'LowBalance') {
                console.warn('Low Balance Alert', {
                  currentBalance: event.args[0].toString(),
                  threshold: event.args[1].toString(),
                  timestamp: new Date(Number(event.args[2]) * 1000).toISOString(),
                  transactionHash: event.transactionHash
                });
              } else if (event.fragment.name === 'FaucetPaused') {
                console.warn('Faucet Paused', {
                  by: event.args[0],
                  transactionHash: event.transactionHash
                });
              } else if (event.fragment.name === 'FaucetUnpaused') {
                console.log('Faucet Unpaused', {
                  by: event.args[0],
                  transactionHash: event.transactionHash
                });
              } else if (event.fragment.name === 'TokensReceived') {
                console.log('Tokens Received', {
                  from: event.args[0],
                  amount: event.args[1].toString(),
                  transactionHash: event.transactionHash
                });
              }
            }
            
            this.lastBlockNumber = currentBlock;
          }
        } catch (error) {
          console.error('Error polling events:', error);
        }
      }, 5000); // Poll every 5 seconds

      this.isListening = true;
      console.log('Event polling started');
    } catch (error) {
      console.error('Failed to start event polling:', error);
      throw error;
    }
  }

  async stopListening() {
    if (!this.isListening) return;

    console.log('Stopping event polling...');
    
    try {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
      }
      
      this.isListening = false;
      console.log('Event polling stopped');
    } catch (error) {
      console.error('Error stopping event polling:', error);
      throw error;
    }
  }
}

module.exports = { EventLogger }; 