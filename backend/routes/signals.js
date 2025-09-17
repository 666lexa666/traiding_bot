const express = require("express");
const router = express.Router();
const Signal = require("../models/Signal");
const History = require("../models/History");

// Вспомогательная функция для расчёта TP и SL
function calculateTakeProfitStopLoss(openPrice) {
  // Простейший пример: TP +2%, SL -1.5%
  const takeProfit = parseFloat((openPrice * 1.02).toFixed(2));
  const stopLoss = parseFloat((openPrice * 0.985).toFixed(2));
  return { takeProfit, stopLoss };
}

// Создать новый сигнал
router.post("/", async (req, res) => {
  try {
    const { pair, timeframe } = req.body;

    if (!pair || !timeframe) {
      return res.status(400).json({ error: "Необходимо указать валютную пару и таймфрейм" });
    }

    // Здесь можно запросить текущую цену через API биржи или бота
    // Для примера возьмем фиктивную цену
    const openPrice = 100; // TODO: заменить на реальную цену с биржи

    const { takeProfit, stopLoss } = calculateTakeProfitStopLoss(openPrice);

    const signal = new Signal({
      pair,
      timeframe,
      openPrice,
      takeProfit,
      stopLoss,
      status: "active",
      openTime: new Date()
    });

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
      profitPercent,
      closedAt: new Date()
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
