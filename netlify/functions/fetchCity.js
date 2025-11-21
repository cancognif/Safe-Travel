exports.handler = async (event, context) => {
  try {
    const { iata } = JSON.parse(event.body);

    const url = `https://places.aviasales.ru/v2/places.json?code=${iata}`;
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
