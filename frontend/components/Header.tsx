'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface HeaderProps {
  account: string;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isWrongChain?: boolean;
}

export const Header = memo(function Header({ 
  account, 
  loading, 
  onConnect, 
  onDisconnect,
  isWrongChain = false 
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDisconnect = async () => {
    // Call the parent's onDisconnect handler
    onDisconnect();
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">TFIDE Mantle Sepolia</h1>
          
          <div className="flex items-center gap-4">
            {isWrongChain && account && (
              <div className="px-4 py-2 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Unsupported Chain
              </div>
            )}
            {account ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  {account.slice(0, 6)}...{account.slice(-4)}
                  <svg 
                    className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={handleDisconnect}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onConnect}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium disabled:bg-blue-800 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Connecting...</span>
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}); 