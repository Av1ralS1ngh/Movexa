import { useState, useEffect } from 'react';
import { usePrivyWallet } from './usePrivyWallet';
import { NFTMetadata } from '@/types/nft';
import { ERC721_ABI } from '@/lib/contracts/abi/erc_721';
import { CONTRACT_ADDRESS_NFT_MINTER } from '@/lib/contracts/contract-config';
import { useBlockchain } from '@/lib/context/BlockchainContext';

export function useNFTInventory() {
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, NFTMetadata>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, authenticated, signer } = usePrivyWallet();
  const { tokenURI } = useBlockchain();

  useEffect(() => {
    let mounted = true;

    const fetchNFTs = async () => {
      if (!address || !authenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const web3 = await signer();
        
        // Create contract instance
        const contract = new web3.eth.Contract(ERC721_ABI as any, CONTRACT_ADDRESS_NFT_MINTER);

        const ownedTokenIds = [];
        let tokenId = 1;
        let consecutiveFailures = 0;
        const MAX_CONSECUTIVE_FAILURES = 5; // Stop after 5 consecutive failures

        // Keep checking tokens until we hit consecutive failures
        while (consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
          try {
            const owner = await contract.methods.ownerOf(tokenId).call();
            if (owner.toLowerCase() === address.toLowerCase()) {
              ownedTokenIds.push(tokenId.toString());
              consecutiveFailures = 0; // Reset consecutive failures when we find an owned token
            }
            tokenId++;
          } catch (err) {
            console.log(`Token ${tokenId} check failed:`, err);
            consecutiveFailures++;
            tokenId++;
          }
        }

        console.log(`Found ${ownedTokenIds.length} NFTs after checking ${tokenId - 1} tokens`);

        if (mounted) {
          setTokenIds(ownedTokenIds);
          console.log('Owned token IDs:', ownedTokenIds);
          
          // Fetch metadata for each owned token using tokenURI from contract
          const metadataPromises = ownedTokenIds.map(async (id) => {
            try {
              const uri = await tokenURI(id,signer);
              const response = await fetch(uri);
              if (!response.ok) throw new Error(`Failed to fetch metadata for token ${id}`);
              return { id, metadata: await response.json() };
            } catch (err) {
              console.error(`Error fetching metadata for token ${id}:`, err);
              return { id, metadata: null };
            }
          });

          const metadataResults = await Promise.all(metadataPromises);
          const metadataMap = metadataResults.reduce((acc, { id, metadata }) => {
            if (metadata) {
              acc[id] = metadata;
            }
            return acc;
          }, {} as Record<string, NFTMetadata>);

          setMetadata(metadataMap);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        if (mounted) {
          setError('Failed to fetch NFTs');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNFTs();
    
    return () => {
      mounted = false;
    };
  }, [address, authenticated, signer, tokenURI]);

  return { tokenIds, metadata, isLoading, error };
}
