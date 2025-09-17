const mongoose = require("mongoose");

const SignalSchema = new mongoose.Schema({
  pair: { type: String, required: true },
  timeframe: { type: String, required: true },
  openPrice: { type: Number, required: true },
  takeProfit: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  status: { type: String, default: "active" }, // active / success / failed
  openTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Signal", SignalSchema);
