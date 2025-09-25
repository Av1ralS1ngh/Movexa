import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

export class AptosService {
  private aptos: Aptos;
  private adminAccount: Account | null;
  private contractAddress: string;

  constructor(env?: any) {
    // Initialize Aptos client
    const config = new AptosConfig({ 
      network: Network.TESTNET // Change to MAINNET for production
    });
    this.aptos = new Aptos(config);
    
    // Initialize admin account from environment variable
    const privateKeyHex = env?.APTOS_PRIVATE_KEY;
    if (privateKeyHex) {
      const privateKey = new Ed25519PrivateKey(privateKeyHex);
      this.adminAccount = Account.fromPrivateKey({ privateKey });
    } else {
      this.adminAccount = null;
      console.warn('APTOS_PRIVATE_KEY not provided. Admin functions will not work.');
    }
    
    // Contract address (replace with your deployed contract address)
    this.contractAddress = env?.APTOS_CONTRACT_ADDRESS || 
      '0xe4cfa8990d773402c3a4b5f40796dcac63c5b6ef9c703c54e6bfc07484b32557';
  }

  /**
   * Get CoA token balance for a given address
   */
  async getCoABalance(address: string): Promise<number> {
    try {
      const balance = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::coins_of_aura::balance`,
          functionArguments: [address],
        }
      }) as [string];
      
      // Convert from smallest unit (8 decimals) to CoA
      return parseInt(balance[0]) / Math.pow(10, 8);
    } catch (error) {
      console.error('Error fetching CoA balance:', error);
      throw new Error('Failed to fetch CoA balance');
    }
  }

  /**
   * Reward new player with 650 CoA tokens
   */
  async rewardNewPlayer(playerAddress: string): Promise<string> {
    if (!this.adminAccount) {
      throw new Error('Admin account not initialized. APTOS_PRIVATE_KEY environment variable required.');
    }

    try {
      const transaction = await this.aptos.transaction.build.simple({
        sender: this.adminAccount.accountAddress,
        data: {
          function: `${this.contractAddress}::coins_of_aura::reward_new_player`,
          functionArguments: [playerAddress],
        },
      });

      // Sign and submit transaction
      const committedTxn = await this.aptos.signAndSubmitTransaction({
        signer: this.adminAccount,
        transaction,
      });

      // Wait for transaction confirmation
      const executedTransaction = await this.aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error('Error rewarding new player:', error);
      throw new Error('Failed to reward new player with CoA tokens');
    }
  }

  /**
   * Mint CoA tokens to a specific address (admin function)
   */
  async mintCoA(toAddress: string, amount: number): Promise<string> {
    if (!this.adminAccount) {
      throw new Error('Admin account not initialized. APTOS_PRIVATE_KEY environment variable required.');
    }

    try {
      // Convert amount to smallest unit (8 decimals)
      const amountInSmallestUnit = Math.floor(amount * Math.pow(10, 8));

      const transaction = await this.aptos.transaction.build.simple({
        sender: this.adminAccount.accountAddress,
        data: {
          function: `${this.contractAddress}::coins_of_aura::mint`,
          functionArguments: [toAddress, amountInSmallestUnit.toString()],
        },
      });

      const committedTxn = await this.aptos.signAndSubmitTransaction({
        signer: this.adminAccount,
        transaction,
      });

      const executedTransaction = await this.aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      return executedTransaction.hash;
    } catch (error) {
      console.error('Error minting CoA tokens:', error);
      throw new Error('Failed to mint CoA tokens');
    }
  }

  /**
   * Get account tokens (including CoA)
   */
  async getAccountTokens(ownerAddress: string): Promise<any[]> {
    try {
      // Get account resources to find token balances
      const resources = await this.aptos.getAccountResources({
        accountAddress: ownerAddress,
      });

      const tokens = [];

      // Look for CoA token balance
      const coaBalance = await this.getCoABalance(ownerAddress);
      if (coaBalance > 0) {
        tokens.push({
          name: 'Coins of Aura',
          symbol: 'CoA',
          balance: coaBalance,
          decimals: 8,
        });
      }

      // Look for APT balance
      const aptResource = resources.find((resource: any) => 
        resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );

      if (aptResource) {
        const aptBalance = parseInt((aptResource.data as any).coin.value) / Math.pow(10, 8);
        tokens.push({
          name: 'Aptos Coin',
          symbol: 'APT',
          balance: aptBalance,
          decimals: 8,
        });
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching account tokens:', error);
      throw new Error('Failed to fetch account tokens');
    }
  }

  /**
   * Check if player is eligible for new player reward
   */
  async isEligibleForReward(playerAddress: string): Promise<boolean> {
    try {
      const balance = await this.getCoABalance(playerAddress);
      // Player is eligible if they have 0 CoA tokens
      return balance === 0;
    } catch (error) {
      // If we can't fetch balance, assume they're eligible
      return true;
    }
  }

  /**
   * Get CoA token metadata
   */
  async getCoAMetadata(): Promise<any> {
    try {
      const name = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::coins_of_aura::name`,
          functionArguments: [],
        }
      }) as [string];

      const symbol = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::coins_of_aura::symbol`,
          functionArguments: [],
        }
      }) as [string];

      const decimals = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::coins_of_aura::decimals`,
          functionArguments: [],
        }
      }) as [number];

      const totalSupply = await this.aptos.view({
        payload: {
          function: `${this.contractAddress}::coins_of_aura::total_supply`,
          functionArguments: [],
        }
      }) as [string];

      return {
        name: name[0],
        symbol: symbol[0],
        decimals: decimals[0],
        totalSupply: parseInt(totalSupply[0]) / Math.pow(10, 8),
      };
    } catch (error) {
      console.error('Error fetching CoA metadata:', error);
      throw new Error('Failed to fetch CoA metadata');
    }
  }
}
