export default async function handler(req, res) {
  try {
    const body = JSON.parse(req.body || "{}");
    const lat = body.lat;
    const lon = body.lon;

    if (!lat || !lon) {
      return res.status(200).json({ daily: null });
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
      `&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max&timezone=Europe%2FRome`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({
      error: "fetchWeather error",
      details: e.message
    });
  }
}
