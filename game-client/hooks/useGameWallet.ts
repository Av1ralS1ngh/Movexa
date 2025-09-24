import { useState, useEffect } from 'react';
import { usePrivyWallet } from './usePrivyWallet';
import Web3 from 'web3';
import { ERC20_ABI } from '@/lib/contracts/abi/erc_20';

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MINTER;


export function useGameWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, authenticated, signer } = usePrivyWallet();

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchBalance = async () => {
      if (!address || !authenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get web3 instance from wallet
        const web3 = await signer();
        // Create contract instance
        const contract = new web3.eth.Contract(ERC20_ABI as any, TOKEN_ADDRESS);

        // Get decimals and balance
        const [decimals, rawBalance] = await Promise.all([
          contract.methods.decimals().call(),
          contract.methods.balanceOf(address).call()
        ]);

        if (mounted) {
          const formattedBalance = Number(rawBalance) / Math.pow(10, Number(decimals));
          setBalance(formattedBalance);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching token balance:', err);
          setError('Failed to fetch balance');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBalance();
    
    // Refresh every 30 seconds
    intervalId = setInterval(fetchBalance, 30000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [address, authenticated]);

  return { balance, isLoading, error };
}
