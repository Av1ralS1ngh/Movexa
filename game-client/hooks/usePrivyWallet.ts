import { useState, useCallback, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { WalletTransaction } from '../types/wallet';
import { ethers } from 'ethers';
import Web3 from 'web3';

export function usePrivyWallet() {
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: privyLogin, logout: privyLogout, authenticated, ready, connectWallet, connectOrCreateWallet, user } = usePrivy();
  const { wallets } = useWallets();
  
  const activeWallet = wallets[0];
  
  useEffect(() => {
    console.log("Wallet", activeWallet);
    console.log("Authenticated", authenticated);
  }, [wallets]);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await privyLogin();
      console.log('Wallet connected:', wallets);
    } catch (err) {
      throw new Error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [privyLogin, wallets]);

  const logout = useCallback(async () => {
    try {
      await privyLogout();
    } catch (err) {
      throw new Error('Failed to logout');
    }
  }, [privyLogout]);

  const fetchWalletData = useCallback(async () => {
    if (!activeWallet?.address) return;

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(`https://${process.env.NEXT_PUBLIC_RPC_URL}`);
      const rawBalance = await provider.getBalance(activeWallet.address);
      setBalance(rawBalance);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  }, [activeWallet?.address]);

  const getSigner = useCallback(async () => {
    if (!wallets[0]) {
      throw new Error('No wallet connected');
    }
    
    try {
      // Get the provider first
      // Then get the signer
      const provider =  await activeWallet.getEthereumProvider();
      const web3=new Web3(provider);
      return web3;
    } catch (err) {
      console.error('Error getting signer:', err);
      throw new Error('Failed to get signer from wallet');
    }
  }, [activeWallet]);

  useEffect(() => {
    if (authenticated && activeWallet?.address) {
      fetchWalletData();
    }
  }, [authenticated, activeWallet?.address, fetchWalletData]);

  return {
    user,
    connect,
    logout,
    isConnecting,
    loading,
    error,
    authenticated,
    ready,
    address: activeWallet?.address,
    balance,
    transactions,
    signer: getSigner
  };
}
