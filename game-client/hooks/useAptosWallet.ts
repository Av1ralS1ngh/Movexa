'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Network, Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { CoATokenService } from '@/lib/services/coaTokenService';

interface PetraWallet {
  connect(): Promise<{ address: string; network?: string }>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  account(): Promise<{ address: string }>;
  signAndSubmitTransaction(transaction: unknown): Promise<unknown>;
}

declare global {
  interface Window {
    petra?: PetraWallet;
    aptos?: PetraWallet;
  }
}

interface AptosWalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  coaBalance: number;
  network: string;
}

const APTOS_MAINNET_RPC = 'https://fullnode.mainnet.aptoslabs.com/v1';

export function useAptosWallet() {
  const [walletState, setWalletState] = useState<AptosWalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    balance: '0',
    coaBalance: 0,
    network: 'mainnet'
  });
  
  const [error, setError] = useState<string | null>(null);

  // Check if Petra wallet is installed
  const isPetraInstalled = useCallback(() => {
    return typeof window !== 'undefined' && (window.petra || window.aptos);
  }, []);

  // Get wallet balance using direct API call
  const getBalance = useCallback(async (address: string): Promise<string> => {
    try {
      const response = await fetch(`${APTOS_MAINNET_RPC}/accounts/${address}/resources`);
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      
      const resources = await response.json();
      const coinResource = resources.find((r: { type: string; data: unknown }) => 
        r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      if (coinResource && coinResource.data && coinResource.data.coin) {
        const balance = coinResource.data.coin.value;
        return (parseInt(balance) / Math.pow(10, 8)).toFixed(4); // Convert from Octas to APT
      }
      return '0';
    } catch (err) {
      console.error('Error fetching balance:', err);
      return '0';
    }
  }, []);

  // Get CoA token balance
  const getCoABalance = useCallback(async (address: string): Promise<number> => {
    try {
      const balanceData = await CoATokenService.getBalance(address);
      return balanceData.balance;
    } catch (err) {
      console.error('Error fetching CoA balance:', err);
      return 0;
    }
  }, []);

  // Reward new player with CoA tokens
  const rewardNewPlayer = useCallback(async (address: string): Promise<void> => {
    try {
      await CoATokenService.rewardNewPlayer(address);
      // Refresh CoA balance after reward
      const newCoABalance = await getCoABalance(address);
      setWalletState(prev => ({ ...prev, coaBalance: newCoABalance }));
    } catch (err) {
      console.error('Error rewarding new player:', err);
      // Don't throw error if reward fails, player can still use the app
    }
  }, [getCoABalance]);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (!isPetraInstalled()) return;

      try {
        const wallet = window.petra || window.aptos;
        if (!wallet) return;
        
        const isConnected = await wallet.isConnected();
        
        if (isConnected) {
          const account = await wallet.account();
          const balance = await getBalance(account.address);
          const coaBalance = await getCoABalance(account.address);
          
          setWalletState({
            address: account.address,
            isConnected: true,
            isConnecting: false,
            balance,
            coaBalance,
            network: 'mainnet'
          });
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkConnection();
  }, [isPetraInstalled, getBalance, getCoABalance, rewardNewPlayer]);

  // Connect to Petra wallet
  const connect = useCallback(async () => {
    if (!isPetraInstalled()) {
      setError('Petra wallet is not installed. Please install it from the Chrome Web Store.');
      window.open('https://petra.app/', '_blank');
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true }));
    setError(null);

    try {
      const wallet = window.petra || window.aptos;
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      const response = await wallet.connect();
      
      if (response) {
        const account = await wallet.account();
        const balance = await getBalance(account.address);
        const coaBalance = await getCoABalance(account.address);
        
        setWalletState({
          address: account.address,
          isConnected: true,
          isConnecting: false,
          balance,
          coaBalance,
          network: response.network || 'mainnet'
        });

        // Reward new player if they have 0 CoA tokens
        if (coaBalance === 0) {
          rewardNewPlayer(account.address);
        }
      }
    } catch (err) {
      console.error('Error connecting to Petra wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Petra wallet';
      setError(errorMessage);
      setWalletState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [isPetraInstalled, getBalance, getCoABalance, rewardNewPlayer]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      const wallet = window.petra || window.aptos;
      if (wallet) {
        await wallet.disconnect();
      }
      
      setWalletState({
        address: null,
        isConnected: false,
        isConnecting: false,
        balance: '0',
        coaBalance: 0,
        network: 'mainnet'
      });
      setError(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(errorMessage);
    }
  }, []);

  // Sign and submit transaction
  const signAndSubmitTransaction = useCallback(async (transaction: unknown) => {
    if (!walletState.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const wallet = window.petra || window.aptos;
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      const response = await wallet.signAndSubmitTransaction(transaction);
      return response;
    } catch (err) {
      console.error('Error signing transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign transaction';
      throw new Error(errorMessage);
    }
  }, [walletState.isConnected]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (walletState.address) {
      const balance = await getBalance(walletState.address);
      const coaBalance = await getCoABalance(walletState.address);
      setWalletState(prev => ({ ...prev, balance, coaBalance }));
    }
  }, [walletState.address, getBalance, getCoABalance]);

  return {
    ...walletState,
    error,
    isPetraInstalled: isPetraInstalled(),
    connect,
    disconnect,
    signAndSubmitTransaction,
    refreshBalance,
    rewardNewPlayer,
    getCoABalance
  };
}