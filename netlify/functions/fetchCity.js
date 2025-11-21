// CACHE LOCALE: mantiene il DB in memoria per richieste successive
let airportDB = null;

exports.handler = async (event, context) => {
  try {
    const { iata } = JSON.parse(event.body);

    // 1. Se abbiamo già il DB in cache → usa quello
    if (airportDB) {
      const match = airportDB.find(a => a.iata === iata);
      if (match) return success(match);
      return fallback(iata);
    }

    // 2. Se non abbiamo il DB, scarichiamolo (una volta sola)
    const url = "https://api.travelpayouts.com/data/airports.json";
    const res = await fetch(url);
    const json = await res.json();

    airportDB = json; // salviamo in memoria

    // 3. Trova l’aeroporto richiesto
    const found = airportDB.find(a => a.iata === iata);

    if (found) return success(found);
    return fallback(iata);

  } catch (e) {
    console.log("🔥 fetchCity error:", e);
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        name: "Destinazione sconosciuta", 
        country: "-", 
        lat: 0, 
        lon: 0 
      })
    };
  }
};

// Success formatter
function success(a) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      name: a.city || a.name,
      country: a.country || a.country_name || "Sconosciuto",
      lat: a.lat,
      lon: a.lon
    })
  };
}

// Fallback intelligente
function fallback(iata) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      name: `Aeroporto ${iata}`,
      country: "Sconosciuto",
      lat: 0,
      lon: 0
    })
  };
}
