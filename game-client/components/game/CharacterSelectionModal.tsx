'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';
import { useBlockchain } from '@/lib/context/BlockchainContext';
import { usePrivyWallet } from '@/hooks/usePrivyWallet';
import { useToast } from '@/hooks/use-toast';

interface Character {
  id: string;
  name: string;
  image: string;
  description: string;
}

const characters: Character[] = [
  {
    id: '1',
    name: 'Warrior',
    image: '/assets/warrior.jpeg',
    description: 'A powerful melee fighter with high defense',
  },
  {
    id: '2',
    name: 'Mage',
    image: '/assets/mage.jpeg',
    description: 'A master of arcane arts with powerful spells',
  },
  {
    id: '3',
    name: 'Rogue',
    image: '/assets/rogue.jpeg',
    description: 'A swift and stealthy assassin',
  },
  {
    id: '4',
    name: 'Archer',
    image: '/assets/archer.jpeg',
    description: 'A precise ranged fighter with deadly accuracy',
  },
  {
    id: '5',
    name: 'Paladin',
    image: '/assets/paladin.jpeg',
    description: 'A holy warrior with healing abilities',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CharacterSelectionModal({ isOpen, onClose }: Props) {
  const { mintTokens, mintNFTs, isLoadingTokens, isLoadingNFTs } = useBlockchain();
  const { signer } = usePrivyWallet();
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = React.useState<string>('');
  const [cityName, setCityName] = React.useState<string>('');
  const [step, setStep] = React.useState<'character' | 'city'>('character');

  const handleConfirm = async () => {
    if (!cityName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a city name",
      });
      return;
    }

    try {
      // First mint tokens
      toast({
        title: "Minting Tokens",
        description: "Please wait while we mint your tokens...",
      });
      
      const tokenTx = await mintTokens(signer);
      
      toast({
        title: "Tokens Minted!",
        description: "Successfully minted 5000 AURA tokens.",
      });

      // Then mint NFTs
      toast({
        title: "Minting NFTs",
        description: "Please wait while we mint your NFTs...",
      });
      
      const nftTx = await mintNFTs(signer);
      
      toast({
        title: "NFTs Minted!",
        description: "Successfully minted 5 character NFTs.",
      });

      onClose();
    } catch (error) {
      console.error('Error during character creation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mint. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl rounded-xl bg-white p-6">
          <Dialog.Title className="text-2xl font-bold mb-4">
            {step === 'character' ? 'Choose Your Character' : 'Enter Your City'}
          </Dialog.Title>

          {step === 'character' ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    selectedCharacter === character.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedCharacter(character.id)}
                >
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-bold">{character.name}</h3>
                  <p className="text-sm text-gray-600">{character.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your city name
              </label>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter the name of your city"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                This will be your character's starting location
              </p>
            </div>
          )}

          <div className="flex justify-between">
            {step === 'city' && (
              <button
                onClick={() => setStep('character')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
            )}
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
              disabled={isLoadingTokens || isLoadingNFTs || (step === 'character' ? !selectedCharacter : !cityName.trim())}
              onClick={() => {
                if (step === 'character') {
                  setStep('city');
                } else {
                  handleConfirm();
                }
              }}
            >
              {isLoadingTokens || isLoadingNFTs 
                ? 'Processing...' 
                : step === 'character' 
                  ? 'Next' 
                  : 'Start Game'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
