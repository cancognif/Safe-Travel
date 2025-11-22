export default async function handler(req, res) {
  try {
    const body = JSON.parse(req.body || "{}");
    let origin = body.origin || "MXP"; // fallback forte

    // Regole per aeroporti multi-city
    if (origin === "MIL") origin = "MXP";
    if (origin === "ROM") origin = "FCO";

    const url =
      `https://api.travelpayouts.com/v3/prices/cheap?` +
      `origin=${origin}&currency=EUR&token=02dd565a82ec75665c68543e34abc5d6`;

    const response = await fetch(url);
    const data = await response.json();

    // Travelpayouts returns data in a weird nested structure:
    // { data: { DESTINATION_IATA: { ...info } } }
    const formatted = [];

    if (data?.data) {
      for (const destIATA in data.data) {
        const item = data.data[destIATA][0]; 
        if (!item) continue;

        formatted.push({
          destination: destIATA,
          price: Math.round(item.price)
        });
      }
    }

    res.status(200).json({ data: formatted });

  } catch (e) {
    console.error("fetchDestinations error:", e);
    res.status(500).json({
      error: "Internal API error",
      details: e.message
    });
  }
}
