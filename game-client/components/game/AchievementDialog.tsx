import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBlockchain } from '@/lib/context/BlockchainContext';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';

interface AchievementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goldAmount: number;
  onGamePause: () => void;
  onGameResume: () => void;
}

export default function AchievementDialog({
  isOpen,
  onClose,
  goldAmount,
  onGamePause,
  onGameResume,
}: AchievementDialogProps) {
  const [isMinting, setIsMinting] = useState(false);
  const { mintSoulboundNFT } = useBlockchain();
  const { toast } = useToast();
  const { signer } = usePrivyWallet();

  // Pause game when dialog opens
  useEffect(() => {
    if (isOpen) {
      onGamePause();
    }
  }, [isOpen, onGamePause]);

  const handleClose = () => {
    onGameResume();
    onClose();
  };

  const handleMint = async () => {
    try {
      setIsMinting(true);
      await mintSoulboundNFT(signer);
      toast({
        title: "Achievement Unlocked!",
        description: "Successfully minted your Gold Master Soulbound NFT!",
        variant: "default",
      });
      handleClose();
    } catch (error) {
      console.error("Error minting soulbound NFT:", error);
      toast({
        title: "Error",
        description: "Failed to mint Soulbound NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Gold Master Achievement Unlocked! 🏆
          </DialogTitle>
          <div className="text-center mt-4 text-white">
            <p className="text-xl text-white">Congratulations!</p>
            <p className="text-lg mt-2 text-white">You've accumulated {goldAmount} gold!</p>
            <p className="text-sm mt-4 text-white">Claim your Gold Master NFT to commemorate this achievement.</p>
          </div>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-32 h-32">
            <Image
              src="/achievement-badge.png"
              alt="Achievement Badge"
              fill
              className="object-contain"
            />
          </div>
          <Button
            variant="default"
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleMint}
            disabled={isMinting}
          >
            {isMinting ? "Minting..." : "Claim Gold Master NFT"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
