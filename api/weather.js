export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const { city, lat, lon } = req.query;

  if (!apiKey) return res.status(500).json({ error: "Missing API key." });

  let endpoint = "";
  if (lat && lon) {
    endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  } else if (city) {
    endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${apiKey}`;
  } else {
    return res.status(400).json({ error: "City or coordinates required." });
  }

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(data.cod).json({ error: data.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Weather proxy fetch error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
