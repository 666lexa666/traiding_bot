// backend/routes/signals.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const Signal = require("../models/Signal");
const History = require("../models/History");

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn("OPENAI_API_KEY not set — OpenAI calls will fail");
}

// ----------------- helpers -----------------
const timeframeToMinutes = (tf) => {
  const map = { '5m':5, '15m':15, '30m':30, '45m':45, '1h':60, '2h':120 };
  return map[tf] || 60;
};

// Bybit public kline fetch (adjust symbol format if needed)
async function fetchBybitCandles(symbol, interval, limit = 500) {
  // Bybit v2 public kline endpoint example:
  // /v2/public/kline/list?symbol=BTCUSDT&interval=15&limit=200
  // symbol must be like "BTCUSDT" (no slash)
  try {
    const apiUrl = `https://api.binance.com/api/v3/klines`;
    const res = await axios.get(apiUrl, {
      params: {
        symbol: symbol.replace("/", ""), // BTC/USDT -> BTCUSDT
        interval, // e.g. '15' for 15m? Bybit uses '15' or '1' etc depending on API. We'll pass interval as minutes string.
        limit
      },
      timeout: 10000
    });
    // Bybit returns data.result array with {open_time, open, high, low, close, volume}
    const result = res.data.result || res.data;
    // Normalize to array of candles {time, open, high, low, close, volume}
    return (result || []).map(c => ({
      time: new Date(c.open_time * 1000),
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.volume)
    }));
  } catch (err) {
    console.error("fetchBybitCandles error:", err?.response?.data || err.message);
    throw err;
  }
}

// Simple EMA
function ema(values, period) {
  const k = 2 / (period + 1);
  let emaArr = [];
  let prev;
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      prev = values[0];
      emaArr.push(prev);
    } else {
      const val = values[i] * k + prev * (1 - k);
      emaArr.push(val);
      prev = val;
    }
  }
  return emaArr;
}

// Simple RSI
function rsi(values, period = 14) {
  if (values.length < period + 1) return [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const delta = values[i] - values[i-1];
    if (delta >= 0) gains += delta; else losses += Math.abs(delta);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rsiArr = [];
  // first rsi (at index period)
  rsiArr[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain/avgLoss));
  for (let i = period+1; i < values.length; i++) {
    const delta = values[i] - values[i-1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? Math.abs(delta) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsiArr[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain/avgLoss));
  }
  return rsiArr;
}

// Build the prompt for OpenAI — we will request a strict JSON output
function buildOpenAIPrompt({ symbol, timeframe, candles, indicatorsSummary }) {
  // Keep prompt concise but include data snapshot and exact JSON schema requirement
  return [
    { role: "system", content: "You are a professional quantitative trading analyst. Answer strictly in JSON with no extra commentary." },
    { role: "user", content:
`Analyze the recent market action for the pair ${symbol} on timeframe ${timeframe}.
Use the supplied recent candles (most recent last) and the indicators summary.

Candles (timestamp ISO, open, high, low, close):\n` + candles.slice(-60).map(c => `${c.time.toISOString()},${c.open},${c.high},${c.low},${c.close}`).join("\n") + `

Indicators summary:\n${indicatorsSummary}

Return a single JSON object with EXACTLY these fields:
{
  "prediction": "BUY" or "SELL",
  "open_price": number,         // price at signal open (use latest close)
  "stop_loss": number,          // absolute price
  "take_profit": number,        // absolute price
  "confidence": number,         // 0.0 - 1.0
  "comment": "short explanation (1-2 sentences)"
}

Important: respond ONLY with that JSON object and nothing else.`}
  ];
}

// Call OpenAI Chat Completions (Chat API)
async function callOpenAIChat(promptMessages) {
  const url = "https://api.openai.com/v1/chat/completions";
  try {
    const res = await axios.post(url, {
      model: "gpt-4o-mini", // or another model you have access to
      messages: promptMessages,
      max_tokens: 400,
      temperature: 0.2
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 20000
    });
    return res.data;
  } catch (err) {
    console.error("OpenAI call error:", err?.response?.data || err.message);
    throw err;
  }
}

// Get latest price (use Bybit public tickers)
async function fetchLatestPrice(symbol) {
  try {
    const res = await axios.get("https://api.bybit.com/v2/public/tickers", {
      params: { symbol: symbol.replace("/", "") }
    });
    const data = res.data.result && res.data.result[0];
    return data ? parseFloat(data.last_price) : null;
  } catch (err) {
    console.error("fetchLatestPrice error:", err?.response?.data || err.message);
    return null;
  }
}

// Compute profit percent given openPrice and closePrice (percent)
function profitPercent(openPrice, closePrice, direction) {
  if (direction === "BUY") return ((closePrice - openPrice) / openPrice) * 100;
  else return ((openPrice - closePrice) / openPrice) * 100; // SELL/SHORT
}

// ----------------- routes -----------------

// Create new signal — front sends only { pair, timeframe, autoSearch? }
// Returns the created signal with TP/SL
router.post("/", async (req, res) => {
  try {
    let { pair, timeframe, autoSearch } = req.body;
    if (!pair && !autoSearch) return res.status(400).json({ error: "pair or autoSearch required" });
    // If autoSearch requested, you could scan multiple pairs and pick best one.
    // For now, if autoSearch true => use pair = 'BTC/USDT' (placeholder) or implement your auto logic.
    if (autoSearch) pair = pair || "BTC/USDT";

    // Determine interval format for Bybit: Bybit expects interval in minutes as string: '15' for 15m, '60' for 1h, etc.
    const minutes = timeframeToMinutes(timeframe);
    const intervalStr = String(minutes);

    // Fetch recent candles for last 3 days — compute needed limit ~ (3*24*60)/minutes
    const candlesRequired = Math.ceil((3 * 24 * 60) / minutes) + 20;
    const candles = await fetchBybitCandles(pair, intervalStr, Math.min(candlesRequired, 2000));

    if (!candles || candles.length === 0) return res.status(500).json({ error: "No candle data" });

    // Indicators (example): EMA(20), EMA(50), RSI(14)
    const closes = candles.map(c => c.close);
    const ema20 = ema(closes, 20);
    const ema50 = ema(closes, 50);
    const rsi14 = rsi(closes, 14);

    // Build a short indicators summary string
    const latestIdx = closes.length - 1;
    const indicatorsSummary = [
      `latest_close=${closes[latestIdx].toFixed(8)}`,
      `ema20=${(ema20[latestIdx] || 0).toFixed(8)}`,
      `ema50=${(ema50[latestIdx] || 0).toFixed(8)}`,
      `rsi14=${(rsi14[latestIdx] || 0).toFixed(2)}`
    ].join(", ");

    // Build prompt messages
    const prompt = buildOpenAIPrompt({
      symbol: pair,
      timeframe,
      candles,
      indicatorsSummary
    });

    // Call OpenAI
    const openaiResp = await callOpenAIChat(prompt);
    // The assistant response content is expected to be the JSON text
    const aiText = openaiResp.choices && openaiResp.choices[0] && openaiResp.choices[0].message && openaiResp.choices[0].message.content;
    if (!aiText) throw new Error("OpenAI returned no content");

    // Parse JSON strictly — AI must return pure JSON
    let aiJson;
    try {
      aiJson = JSON.parse(aiText);
    } catch (err) {
      // If the model returned text around JSON, try to extract JSON substring
      const jsonMatch = aiText.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        aiJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Unable to parse OpenAI response as JSON: " + aiText);
      }
    }

    // Determine open price (latest close)
    const openPrice = closes[closes.length - 1];

    // Ensure aiJson uses absolute prices for TP/SL — if model returned percents we may need to convert.
    // Here we assume model returns absolute prices; if returns percents you'd convert like:
    // if (aiJson.take_profit < 10) aiJson.take_profit = +(openPrice * (1 + aiJson.take_profit / 100)).toFixed(8);

    // Create DB document
    const signalDoc = new Signal({
      pair,
      timeframe,
      openPrice,
      takeProfit: aiJson.take_profit,
      stopLoss: aiJson.stop_loss,
      status: "active",
      openTime: new Date()
    });

    await signalDoc.save();

    // schedule close-check after timeframe duration (minutes)
    const durationMs = timeframeToMinutes(timeframe) * 60 * 1000;
    setTimeout(async () => {
      try {
        const latestPrice = await fetchLatestPrice(pair);
        if (latestPrice == null) {
          console.warn("Could not fetch latest price for close-check", pair);
          return;
        }
        const direction = aiJson.prediction === "BUY" ? "BUY" : "SELL";
        const profit = profitPercent(openPrice, latestPrice, direction);
        const status = profit >= 0 ? "success" : "failed";
        const historyDoc = new History({
          pair: signalDoc.pair,
          timeframe: signalDoc.timeframe,
          openPrice: signalDoc.openPrice,
          takeProfit: signalDoc.takeProfit,
          stopLoss: signalDoc.stopLoss,
          status,
          profitPercent: +profit.toFixed(2),
          closedAt: new Date()
        });
        await historyDoc.save();
        await Signal.deleteOne({ _id: signalDoc._id });
      } catch (err) {
        console.error("Error in close-check timeout:", err);
      }
    }, durationMs + 2000); // small buffer

    // Return created signal (with AI fields)
    const responsePayload = {
      id: signalDoc._id,
      pair: signalDoc.pair,
      timeframe: signalDoc.timeframe,
      prediction: aiJson.prediction,
      openPrice,
      takeProfit: signalDoc.takeProfit,
      stopLoss: signalDoc.stopLoss,
      confidence: aiJson.confidence || null,
      comment: aiJson.comment || ""
    };

    res.json(responsePayload);
  } catch (err) {
    console.error("POST /api/signals error:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// GET active (already present)
router.get("/active", async (req, res) => {
  try {
    const signals = await Signal.find({ status: "active" });
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
