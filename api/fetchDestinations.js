export default async function handler(req, res) {
  try {
    const body = JSON.parse(req.body || "{}");
    const origin = body.origin || "MIL";

    const url =
      `https://api.travelpayouts.com/v2/prices/latest?` +
      `origin=${origin}&currency=EUR&limit=100&show_to_affiliates=false&sorting=price&token=02dd565a82ec75665c68543e34abc5d6`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({
      error: "Internal API error",
      details: e.message
    });
  }
}

