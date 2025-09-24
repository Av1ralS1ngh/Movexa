# Velmora Backend API Documentation

## Base URL
- Development: `http://localhost:8787`
- Production: `https://your-worker.your-subdomain.workers.dev`

## Endpoints

### Health Check
**GET** `/health`

Returns the health status of the API and available services.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-24T10:30:00.000Z",
  "services": {
    "evm": "available", 
    "aptos": "available"
  }
}
```

### Unified NFT Minting
**POST** `/mint-nft`

Unified endpoint for minting NFTs on both EVM (Sepolia) and Aptos chains.

**Request Body:**
```json
{
  "chain": "evm" | "aptos",
  "userAddress": "string",
  "metadata": {
    "name": "string",
    "description": "string", 
    "external_url": "string",
    "image": "string",
    "attributes": [
      {
        "trait_type": "string",
        "value": "string"
      }
    ],
    "properties": {
      "files": [
        {
          "uri": "string",
          "type": "string"
        }
      ],
      "category": "string",
      "creators": []
    },
    "compiler": "string",
    "rarity": number,
    "skill": number
  }
}
```

**EVM Response (when chain = "evm"):**
```json
{
  "success": true,
  "transactionHash": "0x..."
}
```

**Aptos Response (when chain = "aptos"):**
```json
{
  "success": true,
  "transactionPayload": {
    "function": "0x...::nft_minter::mint_nft",
    "arguments": [
      "NFT Name",
      "NFT Description", 
      "https://image-url.com",
      "[{\"trait_type\":\"rarity\",\"value\":\"rare\"}]",
      "85",
      "72"
    ],
    "type_arguments": []
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Chain-Specific Behavior

### EVM Chain (Sepolia)
- **What it does**: Directly executes the minting transaction on Sepolia testnet
- **Response**: Returns the transaction hash upon successful execution
- **Requirements**: Backend needs a funded wallet and contract deployment

### Aptos Chain
- **What it does**: Constructs a transaction payload for the frontend to sign and submit
- **Response**: Returns the transaction payload object
- **Frontend Responsibility**: The frontend must sign and submit this transaction using the user's wallet

## Environment Variables

```bash
# EVM Configuration (Sepolia Testnet)
EVM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NFT_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...

# Aptos Configuration  
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_MODULE_ADDRESS=0x...
```

## Error Codes

- **400**: Bad Request (missing fields, invalid format)
- **500**: Internal Server Error (transaction failure, service error)

## Usage Examples

### Frontend Integration (EVM)
```typescript
const response = await fetch('/mint-nft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chain: 'evm',
    userAddress: '0x...',
    metadata: { /* NFT metadata */ }
  })
});

const result = await response.json();
if (result.success) {
  console.log('Transaction hash:', result.transactionHash);
}
```

### Frontend Integration (Aptos)
```typescript
const response = await fetch('/mint-nft', {
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chain: 'aptos',
    userAddress: '0x...',
    metadata: { /* NFT metadata */ }
  })
});

const result = await response.json();
if (result.success) {
  // Sign and submit the transaction payload with user's wallet
  const txHash = await wallet.signAndSubmitTransaction(result.transactionPayload);
  console.log('Transaction hash:', txHash);
}
```