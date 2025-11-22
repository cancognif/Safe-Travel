const fs = require("fs");
const path = require("path");

let airportDB = null;

exports.handler = async (event, context) => {
  try {
    const { iata } = JSON.parse(event.body);

    // Carichiamo il DB solo una volta per sessione Netlify
    if (!airportDB) {
      const filePath = path.join(__dirname, "..", "data", "airports.json");
      const raw = fs.readFileSync(filePath, "utf8");
      airportDB = JSON.parse(raw);
    }

    // Cerca l'aeroporto nel DB
    const found = airportDB.find(a => a.iata === iata);

    if (found) {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          name: found.city || found.name,
          country: found.country || "Sconosciuto",
          lat: found.lat,
          lon: found.lon
        })
      };
    }

    // Fallback per aeroporti rarissimi
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        name: `Aeroporto ${iata}`,
        country: "Sconosciuto",
        lat: 0,
        lon: 0
      })
    };

  } catch (e) {
    console.log("🔥 ERROR fetchCity:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: e.message
      })
    };
  }
};
