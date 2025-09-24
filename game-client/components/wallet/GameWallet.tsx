'use client';

import { useGameWallet } from '@/hooks/useGameWallet';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';

export default function GameWallet() {
  const { balance, isLoading, error } = useGameWallet();
  const { address } = usePrivyWallet();

  return (
    <div className="p-4 rounded-lg bg-gray-800 bg-opacity-70 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Wallet</h2>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gray-700">
          <svg
            className="w-6 h-6 text-purple-400"
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
          <div className="text-sm text-gray-400">Token Balance</div>
          {error ? (
            <div className="text-sm text-red-400 mt-1">{error}</div>
          ) : (
            <div className="text-2xl font-bold text-white">
              {balance.toFixed(2)} CoA
            </div>
          )}
          {!address && (
            <div className="text-sm text-gray-400 mt-1">
              Connect wallet to view balance
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
