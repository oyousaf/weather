export default async function handler(req, res) {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res
      .status(400)
      .json({ error: "Query must be at least 2 characters." });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key." });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        query
      )}&limit=5&appid=${apiKey}`
    );
    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Geocoding fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch suggestions." });
  }
}
