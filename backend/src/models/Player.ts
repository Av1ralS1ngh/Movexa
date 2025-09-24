import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  nfts: [{ tokenId: String, metadata: Object }],
  balance: { type: Number, default: 0 },
});

const Player = mongoose.model("Player", PlayerSchema);
