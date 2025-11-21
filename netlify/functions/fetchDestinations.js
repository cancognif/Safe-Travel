exports.handler = async (event, context) => {
  try {
    const { origin } = JSON.parse(event.body);

    console.log("📌 fetchDestinations called with origin:", origin);

    const url = `https://api.travelpayouts.com/v3/prices/cheap?origin=${origin}&currency=EUR&token=02dd565a82ec75665c68543e34abc5d6`;

    console.log("🔗 Calling Travelpayouts URL:", url);

    const res = await fetch(url);

    console.log("📨 Travelpayouts status:", res.status);

    const text = await res.text();
    console.log("📄 Raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("❌ JSON parse error:", e.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid JSON", details: e.message })
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)
    };

  } catch (e) {
    console.log("🔥 Internal function error:", e.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API error", details: e.message })
    };
  }
};
