const mongoose = require("mongoose");

const SignalSchema = new mongoose.Schema({
  pair: { type: String, required: true },
  timeframe: { type: String, required: true },
  signal: { type: String, required: true },
  stop_loss: { type: Number, required: true },
  take_profit: { type: Number, required: true },
  open_price: { type: Number, required: true },
  confidence: { type: Number, required: true },
  comment: { type: String },
  open_time: { type: Date, default: Date.now },
  status: { type: String, default: "open" }
});

module.exports = mongoose.model("Signal", SignalSchema);
