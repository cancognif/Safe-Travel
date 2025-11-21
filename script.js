/* -------------------------------------------------------
   SAFE TRAVEL – VERSIONE A (DINAMICA, ZERO DESTINAZIONI STATICHE)
   Destinazioni generate da Travelpayouts in tempo reale
   Prezzi reali → Meteo reale → TravelScore intelligente
-------------------------------------------------------- */


/* -----------------------------
   MENU MOBILE
----------------------------- */
const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });
}


/* -----------------------------
   LOADER
----------------------------- */
function showLoader() {
  const container = document.getElementById("cardsContainer");
  container.innerHTML = `
    <div style="font-size:16px;text-align:center;padding:20px;color:#2A3F73;">
      Sto cercando le migliori destinazioni reali per te…
    </div>
  `;
}


/* -------------------------------------------------------
   1) API METEO – OPEN METEO
-------------------------------------------------------- */

async function getWeather(lat, lon) {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome`;

    const res = await fetch(url);
    const data = await res.json();

    const min = Math.round(data.daily.temperature_2m_min[0]);
    const max = Math.round(data.daily.temperature_2m_max[0]);

    return `${min}°C / ${max}°C`;
  } catch {
    return "N/D";
  }
}


/* -------------------------------------------------------
   2) API Travelpayouts – PREZZO A/R PER DATE SPECIFICHE
-------------------------------------------------------- */

const TP_TOKEN = "02dd565a82ec75665c68543e34abc5d6";

async function getARPrice(origin, destCode, departDate, returnDate) {
  const url =
    `https://api.travelpayouts.com/v2/prices/calendar?` +
    `origin=${origin}&destination=${destCode}` +
    `&depart_date=${departDate}&return_date=${returnDate}` +
    `&currency=EUR&token=${TP_TOKEN}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.data) return "N/D";

    const key = `${departDate}:${returnDate}`;
    const priceObj = json.data[key];
    if (!priceObj) return "N/D";

    return priceObj.value + " €";
  } catch {
    return "N/D";
  }
}


/* -------------------------------------------------------
   3) API Travelpayouts – TUTTE LE DESTINAZIONI REALI
-------------------------------------------------------- */

async function loadRealDestinations(origin) {
  const url =
    `https://api.travelpayouts.com/v3/prices/cheap?origin=${origin}` +
    `&currency=EUR&token=${TP_TOKEN}`;

  const res = await fetch(url);
  const json = await res.json();

  if (!json.data) return [];

  // json.data = { "LIS": {...}, "OPO": {...}, ... }
  return Object.entries(json.data).map(([iata, info]) => ({
    iata,
    price: info.price,
    airline: info.airline,
    departure_at: info.departure_at,
    return_at: info.return_at,
    transfers: info.transfers,
  }));
}


/* -------------------------------------------------------
   4) RICAVARE INFO SULLA DESTINAZIONE
   (Nome città + lat/lon + area Europa vs Mondo)
-------------------------------------------------------- */

async function getCityInfo(iata) {
  try {
    const url = `https://places.aviasales.ru/v2/places.json?code=${iata}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data[0]) return null;

    return {
      name: data[0].name || iata,
      lat: data[0].coordinates.lat,
      lon: data[0].coordinates.lon,
      country: data[0].country_name,
      isEurope: ["Italy","France","Spain","Portugal","Greece","Germany","Austria","Switzerland","Malta","Croatia","Slovenia","Hungary","Poland","Czechia","Belgium","Netherlands","Denmark","Sweden","Norway","Finland","UK","Ireland","Iceland"].includes(data[0].country_name)
    };

  } catch {
    return null;
  }
}


/* -------------------------------------------------------
   5) CLASSIFICAZIONE AUTOMATICA (mare / città / montagna)
-------------------------------------------------------- */

function classifyDestination(lat, lon) {
  if (lat > 44) return "mountain"; // Europa centrale
  if (lat < 42 && lon > 20) return "sea"; // Grecia
  if (lat < 40) return "sea"; // Mediterraneo sud
  return "city";
}


/* -------------------------------------------------------
   6) TRAVEL SCORE INTELLIGENTE
-------------------------------------------------------- */

function computeScore(dest, filters) {
  let score = 50;

  if (filters.budget === "low" && dest.price > 200) score -= 10;
  if (filters.budget === "mid" && dest.price <= 80) score += 5;
  if (filters.budget === "high") score += 5;

  if (filters.area === "europe" && dest.isEurope) score += 10;
  if (filters.area === "europe" && !dest.isEurope) score -= 10;

  if (filters.type === dest.category) score += 8;

  if (filters.duration === "weekend" && dest.flightTime > 3) score -= 6;

  if (filters.children > 0 && dest.category === "sea") score += 5;

  return score;
}


/* -------------------------------------------------------
   7) GENERA UNA CARD FINALE
-------------------------------------------------------- */

async function createCard(dest, origin, departDate, returnDate) {
  const weather = await getWeather(dest.lat, dest.lon);
  const priceAR = await getARPrice(origin, dest.iata, departDate, returnDate);

  return `
  <div class="card">
    <h3>${dest.name}</h3>
    <p class="card-meta">
      🌍 ${dest.country}<br>
      ✈ Volo da ${origin} → ${dest.iata}<br>
      💶 Prezzo A/R nelle tue date: <b>${priceAR}</b><br>
      🌤 Meteo: ${weather}<br>
      🏖 Categoria: ${dest.category}
    </p>

    <a href="https://www.google.com/travel/flights?q=${origin}%20${dest.iata}"
       target="_blank" class="btn-primary">
      Cerca su Google Flights →
    </a>
  </div>`;
}


/* -------------------------------------------------------
   8) MOTORE PRINCIPALE
-------------------------------------------------------- */

document.getElementById("tripForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const airport = document.getElementById("airport").value;
  const area = document.getElementById("area").value;
  const budget = document.getElementById("budget").value;
  const duration = document.getElementById("duration").value;
  const type = document.getElementById("type").value;
  const vibe = document.getElementById("vibe").value;
  const children = parseInt(document.getElementById("children").value || "0");
  const period = document.getElementById("period").value;

  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!airport || !area || !budget || !duration) {
    alert("Compila tutti i filtri obbligatori");
    return;
  }

  if (!startDate || !endDate) {
    alert("Inserisci le date di partenza e ritorno");
    return;
  }

  showLoader();

  // 1) Ottieni destinazioni reali
  const rawDest = await loadRealDestinations(airport);

  // 2) Arricchisci con info
  const enriched = [];
  for (const d of rawDest.slice(0, 80)) { // massimo 80 destinazioni per velocità
    const info = await getCityInfo(d.iata);
    if (!info) continue;

    enriched.push({
      ...d,
      name: info.name,
      lat: info.lat,
      lon: info.lon,
      country: info.country,
      isEurope: info.isEurope,
      category: classifyDestination(info.lat, info.lon)
    });
  }

  // 3) FILTRI utente
  const filtered = enriched.filter(d => {
    if (area === "europe" && !d.isEurope) return false;
    if (type !== "all" && type !== d.category) return false;
    return true;
  });

  // 4) TRAVEL SCORE
  const scored = filtered
    .map(d => ({
      data: d,
      score: computeScore(d, { area, budget, duration, type, children })
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // 5) Render risultati
  let out = "";
  for (const item of scored) {
    out += await createCard(item.data, airport, startDate, endDate);
  }

  document.getElementById("cardsContainer").innerHTML = out;
});
