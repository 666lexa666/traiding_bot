const express = require("express");
const router = express.Router();
const Signal = require("../models/Signal");
const History = require("../models/History");

// Создать новый сигнал
router.post("/", async (req, res) => {
  try {
    const { pair, timeframe, openPrice, takeProfit, stopLoss } = req.body;

    const signal = new Signal({ pair, timeframe, openPrice, takeProfit, stopLoss });
    await signal.save();

    res.json(signal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить все активные сигналы
router.get("/active", async (req, res) => {
  try {
    const signals = await Signal.find({ status: "active" });
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Закрыть сигнал (перенести в историю)
router.post("/close/:id", async (req, res) => {
  try {
    const { profitPercent, status } = req.body; // success / failed
    const signal = await Signal.findById(req.params.id);
    if (!signal) return res.status(404).json({ error: "Signal not found" });

    const history = new History({
      pair: signal.pair,
      timeframe: signal.timeframe,
      openPrice: signal.openPrice,
      takeProfit: signal.takeProfit,
      stopLoss: signal.stopLoss,
      status,
      profitPercent
    });

    await history.save();
    await signal.deleteOne();

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить историю сигналов
router.get("/history", async (req, res) => {
  try {
    const history = await History.find().sort({ closedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
