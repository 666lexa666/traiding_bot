// api/signal.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { pair, timeframe } = req.body;

    if (!pair || !timeframe) {
      return res.status(400).json({ error: "pair и timeframe обязательны" });
    }

    // ⚡ Запрос к OpenAI для генерации прогноза
    const prompt = `
Ты — опытный трейдер. 
Проанализируй рынок для пары ${pair} на таймфрейме ${timeframe} (учитывай последние 3 часа).
Скажи:
1. Куда пойдет цена (BUY или SELL).
2. Какой стоп-лосс (%) выставить.
3. Какой тейк-профит (%) поставить.
Ответ дай в JSON:
{
  "prediction": "BUY",
  "stopLoss": 1.2,
  "takeProfit": 2.5
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content.trim();

    // Пытаемся распарсить JSON из ответа
    let signal;
    try {
      signal = JSON.parse(content);
    } catch (err) {
      return res.status(500).json({ error: "Ошибка парсинга ответа AI", raw: content });
    }

    // Добавляем время открытия
    signal.openTime = new Date();

    return res.status(200).json(signal);

  } catch (err) {
    console.error("Signal API error:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
}
