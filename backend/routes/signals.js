const express = require("express");
const router = express.Router();
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const Signal = require("../models/Signal");
const History = require("../models/History");

// --- POST /api/signal ---
// Создать новый сигнал
router.post("/signal", async (req, res) => {
  try {
    let { pair, timeframe } = req.body;

    // Если pair не указан, можно выбрать автоматически (заглушка)
    if (!pair) {
      // TODO: реализовать автопоиск лучшей пары
      pair = "BTC/USDT"; 
    }

    // 1. Получаем данные с Bybit за последние 3 часа
    // Пример: 3 часа = 12 свечей по 15м
    const candles = await getBybitCandles(pair, timeframe);

    // 2. Рассчитываем TA и ATR
    const indicators = calculateIndicators(candles); // функция-заглушка

    // 3. Запрос к OpenAI (заглушка, возвращаем тестовый JSON)
    const signalData = await getOpenAISignal(pair, timeframe, candles, indicators);

    // 4. Сохраняем сигнал в MongoDB
    const newSignal = new Signal({
      pair: signalData.pair,
      timeframe: signalData.timeframe,
      signal: signalData.signal,
      stop_loss: signalData.stop_loss,
      take_profit: signalData.take_profit,
      open_price: signalData.open_price,
      confidence: signalData.confidence,
      comment: signalData.comment,
      open_time: new Date(),
      status: "open"
    });

    const savedSignal = await newSignal.save();

    // 5. Таймер на закрытие сделки
    scheduleCloseSignal(savedSignal, timeframe);

    // 6. Отправляем сигнал на фронт
    res.json(savedSignal);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET /api/open-signals ---
// Получить список активных сигналов
router.get("/open-signals", async (req, res) => {
  try {
    const signals = await Signal.find({ status: "open" });
    res.json(signals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- GET /api/history ---
// Получить завершённые сделки
router.get("/history", async (req, res) => {
  try {
    const history = await History.find().sort({ close_time: -1 });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

//////////////////////
// Вспомогательные функции
//////////////////////

// Заглушка для получения свечей с Bybit
async function getBybitCandles(pair, timeframe) {
  // TODO: заменить на реальный API Bybit
  // Возвращаем массив объектов {time, open, high, low, close, volume}
  const candles = [];
  const now = Date.now();
  for (let i = 0; i < 12; i++) {
    candles.push({
      time: now - (12 - i) * 15 * 60 * 1000,
      open: 2700 + Math.random() * 50,
      high: 2700 + Math.random() * 70,
      low: 2700 - Math.random() * 70,
      close: 2700 + Math.random() * 50,
      volume: Math.random() * 100
    });
  }
  return candles;
}

// Заглушка для расчета индикаторов
function calculateIndicators(candles) {
  return {
    EMA20: 2750,
    EMA50: 2730,
    RSI: 60,
    MACD: 20,
    ATR: 50
  };
}

// Заглушка OpenAI
async function getOpenAISignal(pair, timeframe, candles, indicators) {
  // В реальном коде здесь будет запрос к OpenAI
  const openPrice = candles[candles.length - 1].close;
  return {
    pair,
    timeframe,
    signal: "BUY",
    stop_loss: openPrice - 50,
    take_profit: openPrice + 100,
    open_price: openPrice,
    confidence: 0.8,
    comment: "Пример сигнала на основе TA"
  };
}

// Таймер для закрытия сделки
function scheduleCloseSignal(signal, timeframe) {
  // Перевод timeframe в миллисекунды (например "15m")
  const timeMs = parseTimeframeToMs(timeframe);

  setTimeout(async () => {
    try {
      // Получаем последнюю цену (заглушка)
      const closePrice = signal.open_price + (Math.random() > 0.5 ? 30 : -30);

      // Определяем успех / неудачу
      const result = determineResult(signal, closePrice);

      // Рассчитываем процент профита
      const profitPercent = calculateProfitPercent(signal, closePrice, result);

      // Сохраняем в history
      const historyEntry = new History({
        pair: signal.pair,
        timeframe: signal.timeframe,
        signal: signal.signal,
        stop_loss: signal.stop_loss,
        take_profit: signal.take_profit,
        open_price: signal.open_price,
        close_price,
        result,
        profit_percent: profitPercent,
        confidence: signal.confidence,
        comment: signal.comment,
        open_time: signal.open_time,
        close_time: new Date()
      });
      await historyEntry.save();

      // Удаляем сигнал из активных
      await Signal.findByIdAndDelete(signal._id);

      console.log(`Сигнал ${signal._id} закрыт: ${result}, profit: ${profitPercent}%`);
    } catch (err) {
      console.error("Error closing signal:", err);
    }
  }, timeMs);
}

// --- Вспомогательные функции для таймфрейма и расчета прибыли
function parseTimeframeToMs(tf) {
  const num = parseInt(tf);
  if (tf.endsWith("m")) return num * 60 * 1000;
  if (tf.endsWith("h")) return num * 60 * 60 * 1000;
  return 15 * 60 * 1000; // по умолчанию 15 минут
}

function determineResult(signal, closePrice) {
  if (signal.signal === "BUY") return closePrice >= signal.take_profit ? "success" : "fail";
  if (signal.signal === "SELL") return closePrice <= signal.take_profit ? "success" : "fail";
  return "fail";
}

function calculateProfitPercent(signal, closePrice, result) {
  let basePrice;
  if (result === "success") {
    basePrice = signal.signal === "BUY" ? Math.min(closePrice, signal.take_profit) : Math.max(closePrice, signal.take_profit);
  } else {
    basePrice = signal.signal === "BUY" ? Math.max(closePrice, signal.stop_loss) : Math.min(closePrice, signal.stop_loss);
  }

  if (signal.signal === "BUY") {
    return ((basePrice - signal.open_price) / signal.open_price * 100).toFixed(2);
  } else {
    return ((signal.open_price - basePrice) / signal.open_price * 100).toFixed(2);
  }
}
