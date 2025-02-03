'use client';

import { useState, useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQItems: FAQItem[] = [
  {
    question: "I don't see my TFIDE tokens in MetaMask",
    answer: (
      <div className="space-y-3">
        <p>You need to manually import the TFIDE token to see it in your wallet. You can:</p>
        {typeof window !== 'undefined' && (
          <button
            onClick={() => {
              if (window.ethereum) {
                window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC20',
                    options: {
                      address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
                      symbol: 'TFIDE',
                      decimals: 18,
                    },
                  },
                });
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors text-[10px]"
          >
            Add to MetaMask
          </button>
        )}
        <p>Or follow these steps manually:</p>
        <ol className="list-decimal list-inside ml-4">
          <li>Open MetaMask</li>
          <li>Click "Import tokens" at the bottom of the Assets tab</li>
          <li className="flex flex-col space-y-2">
            <span>Enter the token contract address:</span>
            <code className="bg-gray-700 px-3 py-1 rounded text-blue-400 font-mono text-[9px] break-all">
              {process.env.NEXT_PUBLIC_TOKEN_ADDRESS}
            </code>
          </li>
          <li>The token symbol (TFIDE) and decimals (18) will auto-populate</li>
          <li>Click "Add Custom Token"</li>
          <li>Click "Import Tokens" to confirm</li>
        </ol>
      </div>
    ),
  },
  {
    question: "Why do I need to wait 24 hours?",
    answer: "The cooldown period ensures fair distribution of tokens and prevents abuse of the faucet. This helps maintain a stable test environment for all developers.",
  },
  {
    question: "How many tokens can I request?",
    answer: "You can request 100 TEST tokens every 24 hours. This amount should be sufficient for most testing purposes.",
  },
  {
    question: "I'm having issues with the faucet",
    answer: (
      <div className="space-y-2">
        <p>Make sure you're:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Connected to Mantle Sepolia network</li>
          <li>Have enough MNT for gas fees</li>
          <li>Waited for the 24-hour cooldown period</li>
        </ul>
      </div>
    ),
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; 
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {FAQItems.map((item, index) => (
          <div key={index} className="border-b border-gray-700">
            <button
              className="flex justify-between items-center w-full py-4 text-left"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="text-lg font-medium">{item.question}</span>
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-[500px] pb-4' : 'max-h-0'
              }`}
            >
              <div className="text-gray-300 text-[10px] leading-loose">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 