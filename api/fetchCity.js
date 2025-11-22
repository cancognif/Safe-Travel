import fs from "fs";
import path from "path";

let airportDB = null;

export default async function handler(req, res) {
  try {
    const body = JSON.parse(req.body || "{}");
    const iata = body.iata;

    if (!iata) {
      return res.status(200).json({
        name: "Sconosciuto",
        country: "Sconosciuto",
        lat: 0,
        lon: 0
      });
    }

    // Carica il DB solo la prima volta
    if (!airportDB) {
      const filePath = path.join(process.cwd(), "data", "airports.json");
      const raw = fs.readFileSync(filePath, "utf8");
      airportDB = JSON.parse(raw);
    }

    // Cerca l'aeroporto nel DB
    const found = airportDB.find(a => a.iata === iata);

    if (found) {
      return res.status(200).json({
        name: found.city || found.name,
        country: found.country || "Sconosciuto",
        lat: found.lat,
        lon: found.lon
      });
    }

    // Fallback intelligente
    res.status(200).json({
      name: `Aeroporto ${iata}`,
      country: "Sconosciuto",
      lat: 0,
      lon: 0
    });

  } catch (e) {
    res.status(500).json({
      error: "fetchCity error",
      details: e.message
    });
  }
}
