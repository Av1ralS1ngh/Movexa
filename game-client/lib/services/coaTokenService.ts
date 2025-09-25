'use client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8787';

export interface CoABalance {
  address: string;
  balance: number;
}

export interface CoAMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}

export interface TokenRewardResponse {
  message: string;
  transactionHash: string;
  amount: number;
}

export class CoATokenService {
  /**
   * Get CoA token balance for an address
   */
  static async getBalance(address: string): Promise<CoABalance> {
    const response = await fetch(`${BACKEND_URL}/aptos/coa/balance/${address}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch CoA balance: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Reward new player with 650 CoA tokens
   */
  static async rewardNewPlayer(playerAddress: string): Promise<TokenRewardResponse> {
    const response = await fetch(`${BACKEND_URL}/aptos/coa/reward-player`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerAddress }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to reward player: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get CoA token metadata
   */
  static async getMetadata(): Promise<CoAMetadata> {
    const response = await fetch(`${BACKEND_URL}/aptos/coa/metadata`);
    if (!response.ok) {
      throw new Error(`Failed to fetch CoA metadata: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get all tokens for an account (including CoA and APT)
   */
  static async getAccountTokens(address: string): Promise<Array<{
    name: string;
    symbol: string;
    balance: number;
    decimals: number;
  }>> {
    const response = await fetch(`${BACKEND_URL}/aptos/tokens/${address}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch account tokens: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Mint CoA tokens (admin function)
   */
  static async mintTokens(toAddress: string, amount: number): Promise<TokenRewardResponse> {
    const response = await fetch(`${BACKEND_URL}/aptos/coa/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toAddress, amount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to mint tokens: ${response.statusText}`);
    }

    return response.json();
  }
}