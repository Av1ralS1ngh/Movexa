import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNFTInventory } from '@/hooks/useNFTInventory';
import { useBlockchain } from '@/lib/context/BlockchainContext';
import { useLockedNFT } from '@/lib/context/LockedNFTContext';
import { useToast } from '@/hooks/use-toast';
import NFTSelectionDialog from './NFTSelectionDialog';
import BattleScene from './BattleScene';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';

interface TradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  npcName: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

const npcDialogs = [
  "Hello fellow, want to buy some NFTs?",
  "I've got something special for you today...",
  "This one is quite rare, I must say...",
  "Ah, a discerning collector, I see!",
];

export default function TradeDialog({ isOpen, onClose, npcName }: TradeDialogProps) {
  const { mintCustomNFT } = useBlockchain();
  const {signer} = usePrivyWallet();
  const { lockNFT } = useLockedNFT();
  const { toast } = useToast();
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);
  const [nftPrice, setNftPrice] = useState<number | null>(null);
  const [showBattleOffer, setShowBattleOffer] = useState(false);
  const [npcMessage, setNpcMessage] = useState(npcDialogs[0]);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
  const [showNFTSelection, setShowNFTSelection] = useState(false);
  const [playerNFT, setPlayerNFT] = useState<NFTMetadata | null>(null);
  const [showBattleScene, setShowBattleScene] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleComplete, setBattleComplete] = useState(false);
  const [battleWon, setBattleWon] = useState(false);
  const { tokenIds } = useNFTInventory();

  useEffect(() => {
    if (isOpen) {
      let availableIds = Array.from({ length: 1200 }, (_, i) => i + 1)
        .filter(id => !tokenIds.includes(id.toString()));
      
      if (availableIds.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableIds.length);
        const randomNFTId = availableIds[randomIndex];
        setSelectedNFT(randomNFTId);
        
        const randomPrice = Math.floor(Math.random() * (320 - 273 + 1)) + 273;
        setNftPrice(randomPrice);
        
        const randomDialog = Math.floor(Math.random() * npcDialogs.length);
        setNpcMessage(npcDialogs[randomDialog]);

        fetch(`https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/${randomNFTId}.json`)
          .then(response => response.json())
          .then(data => setNftMetadata(data))
          .catch(error => console.error('Error fetching NFT metadata:', error));
      }
    } else {
      setNftMetadata(null);
      setSelectedNFT(null);
      setShowBattleOffer(false);
      setShowBattleScene(false);
      setPlayerNFT(null);
      setBattleComplete(false);
      setBattleWon(false);
    }
  }, [isOpen, tokenIds]);

  const handleBattleClick = () => {
    setNpcMessage("You think you can defeat me? Prove that and get 30% discount!");
    setShowBattleOffer(true);
    setShowNFTSelection(true);
    
    // Store NPC for battle
    const gameScene = (window as any).gameScene;
    if (gameScene) {
      // Find the skeleton NPC
      const skeletonNPC = gameScene.npcs.getChildren().find((npc: any) => npc.name === 'Skeleton');
      if (skeletonNPC) {
        gameScene.battleNPC = skeletonNPC;
      }
    }
  };

  const handleNFTSelect = (nft: NFTMetadata) => {
    console.log('Selected NFT:', nft);
    setPlayerNFT(nft);
    setShowNFTSelection(false);
    
    // Start battle immediately after NFT selection
    const gameScene = (window as any).gameScene;
    if (gameScene && gameScene.battleNPC) {
      // Ensure the game is unpaused for battle
      gameScene.resumeGame();
      console.log("Battle NPC", gameScene.battleNPC);
      gameScene.startNPCBattle(gameScene.battleNPC);
      setShowBattleScene(true);
    }
  };

  const handleBattleEnd = (playerWon: boolean) => {
    console.log('Battle ended, player won:', playerWon);
    setShowBattleScene(false);
    setBattleComplete(true);
    setBattleWon(playerWon);
    if (playerWon) {
      setNpcMessage("Impressive! You've earned the discount.");
    } else {
      setNpcMessage("Better luck next time, warrior!");
      setShowBattleOffer(false);
    }
  };

  const handleBattleComplete = (won: boolean) => {
    setBattleComplete(true);
    setBattleWon(won);
    setShowBattleScene(false);
  };

  const handleContinue = () => {
    if (selectedNFT) {
      lockNFT(selectedNFT);
      toast({
        title: battleWon ? "Battle Won" : "Battle Lost",
        description: "Your NFT is locked for 30 minutes!",
        variant: battleWon ? "default" : "destructive",
      });
      onClose();
    }
  };

  const handleBuyNFT = async () => {
    try {
      if (!selectedNFT || nftPrice === null) {
        console.error("No NFT or price selected");
        return;
      }

      const finalPrice = battleWon ? Math.floor(nftPrice * 0.7) : nftPrice;
      console.log("Buying NFT:", selectedNFT, "for price:", finalPrice);
      
      await mintCustomNFT(selectedNFT, finalPrice, signer);
      
      toast({
        title: "Success!",
        description: `Successfully minted NFT #${selectedNFT}${battleWon ? ' with discount!' : ''}`,
        variant: "default",
      });

      // Lock NFT after purchase
      lockNFT(selectedNFT);
      onClose();
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast({
        title: "Error",
        description: "Failed to mint NFT. Please try again.",
        variant: "destructive",
      });
    }
  };

  const discountedPrice = nftPrice ? Math.floor(nftPrice * 0.7) : null;

  return (
    <>
      <Dialog open={isOpen && !showBattleScene} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Trading with {npcName}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {npcMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* NFT Section */}
            {selectedNFT && nftPrice && nftMetadata && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start space-x-6">
                  <div className="relative w-48 h-48">
                    <Image
                      src={nftMetadata.image}
                      alt={nftMetadata.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{nftMetadata.name}</h3>
                    <p className="text-gray-400 mb-2">{nftMetadata.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {nftMetadata.attributes.map((attr, index) => (
                        <div key={index} className="bg-gray-700 p-2 rounded">
                          <span className="text-gray-400">{attr.trait_type}: </span>
                          <span className="text-white">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-yellow-400 text-lg mb-4">
                      {battleWon ? (
                        <span className="flex items-center gap-2">
                          <span className="line-through text-gray-500">{nftPrice} CoA</span>
                          <span>{discountedPrice} CoA</span>
                          <span className="text-green-400 text-sm">(30% off)</span>
                        </span>
                      ) : (
                        `${nftPrice} CoA`
                      )}
                    </p>
                    <div className="space-x-4">
                      {battleComplete ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleBuyNFT}
                            disabled={!selectedNFT}
                          >
                            Buy NFT {battleWon ? 'with Discount' : ''}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleContinue}
                          >
                            Continue
                          </Button>
                        </>
                      ) : !showBattleOffer && (
                        <Button
                          variant="outline"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={handleBattleClick}
                        >
                          Challenge to Battle
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <NFTSelectionDialog
        isOpen={showNFTSelection}
        onClose={() => setShowNFTSelection(false)}
        onSelect={handleNFTSelect}
      />

      {showBattleScene && playerNFT && nftMetadata && (
        <BattleScene
          isVisible={showBattleScene}
          playerNFT={playerNFT}
          npcNFT={nftMetadata}
          onBattleEnd={handleBattleEnd}
        />
      )}
    </>
  );
}
