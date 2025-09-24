'use client';

import React from 'react';

import { PrivyProvider } from '@privy-io/react-auth';
import { LockedNFTProvider } from '@/lib/context/LockedNFTContext';

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error(
    'NEXT_PUBLIC_PRIVY_APP_ID is required but not found in environment variables'
  );
}

// Base Sepolia chain configuration
const baseSepolia = {
  name: 'Sepolia',
  id: 11155111,
  rpcUrls: {
    default: {
      http: [
        `https://${process.env.NEXT_PUBLIC_RPC_URL || 'sepolia.base.org'}`,
      ],
    },
  },
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          showWalletLoginFirst: true,
        },
        loginMethods: ['email', 'wallet', 'google'],
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
      }}
    >
      <LockedNFTProvider>{children}</LockedNFTProvider>
    </PrivyProvider>
  );
}
