// api/signals.js
export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*"); // или поставь фронтовый домен
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  // --- конец CORS ---

  if (req.method === "POST") {
    try {
      const { pair = "BTCUSDT", timeframe = "5m" } = req.body;

      // Заглушка (сюда потом добавим OpenAI или реальный анализ)
      const signal = {
        pair,
        timeframe,
        openTime: new Date().toISOString(),
        openPrice: 27000,
        takeProfit: 27500,
        stopLoss: 26800,
        direction: "long",
      };

      res.status(200).json(signal);
    } catch (error) {
      console.error("Ошибка в /api/signals:", error.message);
      res.status(500).json({ error: "Ошибка при создании сигнала" });
    }
  } else {
    res.status(405).json({ error: "Метод не разрешён" });
  }
}
