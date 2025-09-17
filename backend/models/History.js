const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  pair: { type: String, required: true },
  timeframe: { type: String, required: true },
  openPrice: { type: Number, required: true },
  takeProfit: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  status: { type: String, required: true }, // success / failed
  profitPercent: { type: Number, required: true },
  closedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", HistorySchema);
