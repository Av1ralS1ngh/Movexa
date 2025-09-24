import React, { createContext, useContext, useState, useCallback } from 'react';

interface LockedNFT {
  tokenId: number;
  unlocksAt: number;
}

interface LockedNFTContextType {
  lockedNFTs: LockedNFT[];
  lockNFT: (tokenId: number) => void;
  isNFTLocked: (tokenId: number) => boolean;
  getUnlockTime: (tokenId: number) => number | null;
}

const LockedNFTContext = createContext<LockedNFTContextType | undefined>(undefined);

export function LockedNFTProvider({ children }: { children: React.ReactNode }) {
  const [lockedNFTs, setLockedNFTs] = useState<LockedNFT[]>([]);

  const lockNFT = useCallback((tokenId: number) => {
    const lockDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
    const unlocksAt = Date.now() + lockDuration;
    
    setLockedNFTs(prev => {
      // Remove any existing lock for this NFT
      const filtered = prev.filter(nft => nft.tokenId !== tokenId);
      return [...filtered, { tokenId, unlocksAt }];
    });
  }, []);

  const isNFTLocked = useCallback((tokenId: number) => {
    const lockedNFT = lockedNFTs.find(nft => nft.tokenId === tokenId);
    if (!lockedNFT) return false;
    
    const now = Date.now();
    if (now >= lockedNFT.unlocksAt) {
      // Remove expired lock
      setLockedNFTs(prev => prev.filter(nft => nft.tokenId !== tokenId));
      return false;
    }
    return true;
  }, [lockedNFTs]);

  const getUnlockTime = useCallback((tokenId: number) => {
    const lockedNFT = lockedNFTs.find(nft => nft.tokenId === tokenId);
    return lockedNFT ? lockedNFT.unlocksAt : null;
  }, [lockedNFTs]);

  return (
    <LockedNFTContext.Provider value={{ lockedNFTs, lockNFT, isNFTLocked, getUnlockTime }}>
      {children}
    </LockedNFTContext.Provider>
  );
}

export function useLockedNFT() {
  const context = useContext(LockedNFTContext);
  if (context === undefined) {
    throw new Error('useLockedNFT must be used within a LockedNFTProvider');
  }
  return context;
}
