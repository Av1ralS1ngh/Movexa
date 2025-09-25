'use client';

import { Button } from "@/components/ui/button";
import { useAptosWallet } from "@/hooks/useAptosWallet";
import { FC } from 'react';

interface AptosWalletButtonProps {
  className?: string;
  showBalance?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
}

const AptosWalletButton: FC<AptosWalletButtonProps> = ({ 
  className = "", 
  showBalance = false,
  variant = 'default'
}) => {
  const { 
    connect, 
    disconnect, 
    isConnected, 
    isConnecting, 
    error, 
    isPetraInstalled,
    address,
    balance
  } = useAptosWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isPetraInstalled) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={() => window.open('https://petra.app/', '_blank')}
          variant={variant}
          className={className}
        >
          Install Petra Wallet
        </Button>
        <p className="text-xs text-gray-500">
          Petra wallet is required to use this app
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={connect}
          disabled={isConnecting}
          variant={variant}
          className={className}
        >
          {isConnecting ? 'Connecting...' : 'Connect to Aptos'}
        </Button>
        {error && (
          <p className="text-xs text-red-500 max-w-xs text-center">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col text-right">
        <span className="text-sm font-medium">
          {address ? truncateAddress(address) : 'Connected'}
        </span>
        {showBalance && (
          <span className="text-xs text-gray-500">
            {balance} APT
          </span>
        )}
      </div>
      <Button
        onClick={disconnect}
        variant="outline"
        size="sm"
        className={className}
      >
        Disconnect
      </Button>
    </div>
  );
};

export default AptosWalletButton;