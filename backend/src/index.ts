import { Hono } from 'hono';
import { EVMService } from './services/evmService';
import { AptosService } from './services/aptosService';

const app = new Hono();

const evmService = new EVMService();
// Initialize service with a placeholder - will be updated per request in CF Workers
const aptosService = new AptosService();

app.get('/', (c) => {
  return c.text('Hello from Velmora backend!');
});

// EVM endpoint placeholder
app.get('/evm', (c) => c.json({ message: 'EVM service endpoint' }));

// --- Aptos API Endpoints ---
const aptos = new Hono();

/**
 * GET /aptos/tokens/:ownerAddress
 * Fetches all tokens for a given Aptos account address.
 */
aptos.get('/tokens/:ownerAddress', async (c) => {
  const ownerAddress = c.req.param('ownerAddress');
  try {
    const tokens = await aptosService.getAccountTokens(ownerAddress);
    return c.json(tokens);
  } catch (error: any) {
    console.error(`Failed to fetch tokens for ${ownerAddress}:`, error);
    return c.json({ message: 'Failed to fetch tokens from Aptos.', error: error.message }, 500);
  }
});

/**
 * POST /aptos/mint
 * Mints a new NFT to a specified user address.
 * Expects a JSON body with a `userAddress` field.
 */
aptos.post('/mint', async (c) => {
  try {
    const { userAddress } = await c.req.json();
    if (!userAddress) {
      return c.json({ message: 'userAddress is required in the request body' }, 400);
    }
    // NFT minting functionality to be implemented
    return c.json({ message: 'NFT minting not yet implemented' }, 501);
  } catch (error: any) {
    console.error('Failed to mint NFT:', error);
    return c.json({ message: 'Failed to mint NFT on Aptos.', error: error.message }, 500);
  }
});

/**
 * GET /aptos/coa/balance/:address
 * Get CoA token balance for a specific address.
 */
aptos.get('/coa/balance/:address', async (c) => {
  const address = c.req.param('address');
  try {
    const balance = await aptosService.getCoABalance(address);
    return c.json({ address, balance });
  } catch (error: any) {
    console.error(`Failed to fetch CoA balance for ${address}:`, error);
    return c.json({ message: 'Failed to fetch CoA balance.', error: error.message }, 500);
  }
});

/**
 * POST /aptos/coa/reward-player
 * Reward new player with 650 CoA tokens.
 * Expects a JSON body with a `playerAddress` field.
 */
aptos.post('/coa/reward-player', async (c) => {
  try {
    const { playerAddress } = await c.req.json();
    if (!playerAddress) {
      return c.json({ message: 'playerAddress is required in the request body' }, 400);
    }

    // Check if player is eligible for reward
    const isEligible = await aptosService.isEligibleForReward(playerAddress);
    if (!isEligible) {
      return c.json({ message: 'Player has already received CoA tokens' }, 400);
    }

    const transactionHash = await aptosService.rewardNewPlayer(playerAddress);
    return c.json({ 
      message: 'Player rewarded with 650 CoA tokens successfully', 
      transactionHash,
      amount: 650 
    });
  } catch (error: any) {
    console.error('Failed to reward player:', error);
    return c.json({ message: 'Failed to reward player with CoA tokens.', error: error.message }, 500);
  }
});

/**
 * POST /aptos/coa/mint
 * Mint CoA tokens to a specific address (admin function).
 * Expects a JSON body with `toAddress` and `amount` fields.
 */
aptos.post('/coa/mint', async (c) => {
  try {
    const { toAddress, amount } = await c.req.json();
    if (!toAddress || !amount) {
      return c.json({ message: 'toAddress and amount are required in the request body' }, 400);
    }

    const transactionHash = await aptosService.mintCoA(toAddress, amount);
    return c.json({ 
      message: `${amount} CoA tokens minted successfully`, 
      transactionHash,
      recipient: toAddress,
      amount 
    });
  } catch (error: any) {
    console.error('Failed to mint CoA tokens:', error);
    return c.json({ message: 'Failed to mint CoA tokens.', error: error.message }, 500);
  }
});

/**
 * GET /aptos/coa/metadata
 * Get CoA token metadata (name, symbol, decimals, total supply).
 */
aptos.get('/coa/metadata', async (c) => {
  try {
    const metadata = await aptosService.getCoAMetadata();
    return c.json(metadata);
  } catch (error: any) {
    console.error('Failed to fetch CoA metadata:', error);
    return c.json({ message: 'Failed to fetch CoA metadata.', error: error.message }, 500);
  }
});

app.route('/aptos', aptos);
// -------------------------

export default app;

