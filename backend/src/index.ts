import { Hono } from 'hono';
import { EVMService } from './services/evmService';
import { AptosService } from './services/aptosService';

const app = new Hono();

const evmService = new EVMService();
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
    const result = await aptosService.mintNft(userAddress);
    return c.json({ message: 'NFT minted successfully', transaction: result });
  } catch (error: any) {
    console.error('Failed to mint NFT:', error);
    return c.json({ message: 'Failed to mint NFT on Aptos.', error: error.message }, 500);
  }
});

app.route('/aptos', aptos);
// -------------------------

export default app;

