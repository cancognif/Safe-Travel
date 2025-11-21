exports.handler = async (event, context) => {
  try {
    const { origin } = JSON.parse(event.body);

    console.log("📌 Fetching latest prices for origin:", origin);

    const url =
      `https://api.travelpayouts.com/v2/prices/latest?` +
      `origin=${origin}&currency=EUR&limit=50&show_to_affiliates=false&sorting=price&token=02dd565a82ec75665c68543e34abc5d6`;

    console.log("🔗 Calling Travelpayouts URL:", url);

    const res = await fetch(url);
    console.log("📨 Travelpayouts status:", res.status);

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)
    };

  } catch (e) {
    console.log("🔥 Error in fetchDestinations:", e.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal API error", details: e.message })
    };
  }
};
