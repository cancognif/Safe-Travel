exports.handler = async (event, context) => {
  try {
    const { origin } = JSON.parse(event.body);

    const url =
      `https://api.travelpayouts.com/v2/prices/latest?` +
      `origin=${origin}&currency=EUR&limit=100&show_to_affiliates=false&sorting=price&token=02dd565a82ec75665c68543e34abc5d6`;

    const res = await fetch(url);
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
