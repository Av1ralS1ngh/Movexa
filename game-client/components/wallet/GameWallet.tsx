'use client';

import { useAptosWallet } from '@/hooks/useAptosWallet';

export default function GameWallet() {
  const { balance, coaBalance, address, isConnected, refreshBalance } = useAptosWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="p-4 rounded-lg bg-gray-800 bg-opacity-70 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Aptos Wallet</h2>
        <button 
          onClick={refreshBalance}
          className="text-purple-400 hover:text-purple-300 transition-colors"
          title="Refresh balance"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gray-700">
          <svg
            className="w-6 h-6 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <div className="text-sm text-gray-400">Token Balances</div>
          {isConnected ? (
            <div>
              <div className="text-xl font-bold text-yellow-400">
                {coaBalance} CoA
              </div>
              
              <div className="text-xs text-gray-400 mt-1">
                {address ? truncateAddress(address) : 'Connected'}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 mt-1">
              Connect wallet to view balance
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
