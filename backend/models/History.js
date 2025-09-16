const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  pair: { type: String, required: true },
  timeframe: { type: String, required: true },
  signal: { type: String, required: true },
  stop_loss: { type: Number, required: true },
  take_profit: { type: Number, required: true },
  open_price: { type: Number, required: true },
  close_price: { type: Number, required: true },
  result: { type: String, enum: ["success", "fail"], required: true },
  profit_percent: { type: Number, required: true },
  confidence: { type: Number },
  comment: { type: String },
  open_time: { type: Date },
  close_time: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", HistorySchema);
