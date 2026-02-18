// models/tokenBlacklist.model.js
import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model("TokenBlacklist", tokenBlacklistSchema);
