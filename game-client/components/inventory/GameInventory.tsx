'use client';

import { useState } from 'react';
import { useNFTInventory } from '@/hooks/useNFTInventory';
import { useLockedNFT } from '@/lib/context/LockedNFTContext';
import NFTModal from './NFTModal';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GameInventoryProps {
  onNFTClick: (nft: any) => void;
}

export default function GameInventory({ onNFTClick }: GameInventoryProps) {
  const { tokenIds, metadata, isLoading, error } = useNFTInventory();
  const { isNFTLocked, getUnlockTime } = useLockedNFT();
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const formatTimeLeft = (unlocksAt: number) => {
    const now = Date.now();
    const timeLeft = Math.max(0, unlocksAt - now);
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleNFTClick = (tokenId: string) => {
    const nft = metadata[tokenId];
    if (!isNFTLocked(tokenId)) {
      onNFTClick(nft);
    }
    setSelectedTokenId(tokenId);
  };

  const renderInventoryContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="p-0">
                <Skeleton className="w-full aspect-square rounded-t-xl" />
              </div>
              <div className="p-2">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg border border-red-800">
          {error}
        </div>
      );
    }

    const items = tokenIds.map((tokenId) => {
      const nft = metadata[tokenId];
      console.log(nft);
      if (!nft) return null;

      const isLocked = isNFTLocked(tokenId);
      const unlockTime = getUnlockTime(tokenId);

      return {
        title: "",
        description: (
          <div 
            className={cn(
              "group flex flex-col items-center bg-black/40 rounded-xl overflow-hidden border transition-all cursor-pointer aspect-square",
              isLocked ? "border-red-800/50" : "border-gray-800/50 hover:border-purple-500/50"
            )}
            onClick={() => handleNFTClick(tokenId)}
          >
            <div className="w-full relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                className={cn(
                  "object-cover transition-all",
                  isLocked ? "opacity-40 saturate-50" : "group-hover:scale-105"
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              />
              {isLocked && unlockTime && (
                <>
                  <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/80 px-2 py-1 rounded-full text-white z-30">
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span className="text-xs font-medium">{formatTimeLeft(unlockTime)}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <svg 
                      className="w-20 h-20 text-red-500/50" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  </div>
                </>
              )}
            </div>
            <div className="w-full p-2 flex justify-between items-center bg-black/40 relative z-20">
              <h3 className="text-sm font-medium text-gray-100 group-hover:text-white">
                {nft.name}
              </h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  isLocked ? "bg-red-500/20 text-red-300" : "bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30",
                  "transition-colors duration-200"
                )}
              >
                {isLocked ? "Locked" : `Aura: ${nft.skill}`}
              </Badge>
            </div>
          </div>
        ),
        link: "#",
      };
    }).filter(Boolean) as { title: string; description: React.ReactNode; link: string }[];

    // Calculate rows needed to show 2 items per column
    const rows = Math.ceil(items.length / 3);
    const itemsPerColumn = 2;
    const columns = 3;

    return (
      <div className="w-full px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 auto-rows-min gap-4">
            {Array.from({ length: Math.min(rows * columns, items.length) }).map((_, index) => {
              const item = items[index];
              if (!item) return null;
              return (
                <div key={index} className="h-[200px]">
                  {item.description}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-4">
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-gray-900/50 border border-gray-800 rounded-xl mb-6">
          <TabsTrigger 
            value="inventory" 
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-lg"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger 
            value="chatbot"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-lg"
          >
            Chatbot
          </TabsTrigger>
          <TabsTrigger 
            value="marketplace"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-lg"
          >
            Marketplace
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="w-full">
          <ScrollArea className="h-[calc(100vh-14rem)] w-full">
            {renderInventoryContent()}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="chatbot" className="w-full">
          <div className="text-center p-8 text-gray-400">
            Chatbot interface coming soon...
          </div>
        </TabsContent>
        <TabsContent value="marketplace" className="w-full">
          <div className="text-center p-8 text-gray-400">
            AI Agent Marketplace coming soon...
          </div>
        </TabsContent>
      </Tabs>
      {selectedTokenId && (
        <NFTModal
          tokenId={selectedTokenId}
          metadata={metadata[selectedTokenId]}
          onClose={() => setSelectedTokenId(null)}
        />
      )}
    </div>
  );
}
