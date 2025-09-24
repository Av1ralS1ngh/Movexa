import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNFTInventory } from '@/hooks/useNFTInventory';

interface NFTSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nft: any) => void;
}

export default function NFTSelectionDialog({ isOpen, onClose, onSelect }: NFTSelectionDialogProps) {
  const { tokenIds, metadata, isLoading } = useNFTInventory();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Select Your NFT for Battle</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose wisely! Your NFT's rarity and skills will determine your battle strength.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading your NFTs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {tokenIds.map((tokenId) => {
              const nft = metadata[tokenId];
              if (!nft) return null;

              return (
                <button
                  key={tokenId}
                  onClick={() => onSelect(nft)}
                  className="relative group bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                >
                  <div className="relative w-full aspect-square mb-4">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{nft.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nft.attributes.map((attr: any, index: number) => (
                      <div key={index} className="bg-gray-700 p-2 rounded text-sm">
                        <span className="text-gray-400">{attr.trait_type}: </span>
                        <span className="text-white">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-yellow-500 bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold">
                        Select for Battle
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
