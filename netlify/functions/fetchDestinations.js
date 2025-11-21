exports.handler = async (event, context) => {
  try {
    const { origin } = JSON.parse(event.body);

    const url = `https://api.travelpayouts.com/v3/prices/cheap?origin=${origin}&currency=EUR&token=02dd565a82ec75665c68543e34abc5d6`;

    const res = await fetch(url);
    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API error", details: e.message })
    };
  }
};
