/* -------------------------------------------------------
   SAFE TRAVEL – SCRIPT COMPLETO FINALE (API REALI)
   Con prezzi A/R basati sulle date selezionate
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
      Sto cercando le migliori destinazioni per le tue date…
    </div>
  `;
}


/* -----------------------------
   API METEO – OPEN METEO
----------------------------- */
async function getRealWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FRome`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const tMin = Math.round(data.daily.temperature_2m_min[0]);
    const tMax = Math.round(data.daily.temperature_2m_max[0]);

    return `${tMin}°C / ${tMax}°C`;
  } catch (e) {
    return "Meteo non disponibile";
  }
}


/* -----------------------------
   API VOLI REALI – TRAVELPAYOUTS
   Prezzi A/R per le date selezionate
----------------------------- */

const TRAVELPAYOUTS_TOKEN = "02dd565a82ec75665c68543e34abc5d6";

async function getFlightPriceByDate(origin, destinationCode, departDate, returnDate) {
  if (!departDate || !returnDate) {
    return "Date non valide";
  }

  const url =
    `https://api.travelpayouts.com/v2/prices/calendar?` +
    `origin=${origin}&destination=${destinationCode}` +
    `&depart_date=${departDate}&return_date=${returnDate}` +
    `&currency=EUR&token=${TRAVELPAYOUTS_TOKEN}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.data) return "Prezzo non disponibile";

    const key = `${departDate}:${returnDate}`;
    const priceObj = json.data[key];

    if (!priceObj) return "Prezzo non disponibile";

    return priceObj.value + " €";

  } catch (e) {
    return "Errore prezzo volo";
  }
}


/* -------------------------------------------------------
   DATABASE DESTINAZIONI (puoi aggiungerne altre)
-------------------------------------------------------- */

const destinationsData = [
  {
    name: "Porto, Portogallo",
    area: "europe",
    type: "city",
    vibe: "culture",
    budget: "mid",
    lat: 41.1579,
    lon: -8.6291,
    code: "OPO",
    familyScore: 7,
    flightHours: 2.4,
    tagline: "Perfetta per weekend e cultura, ideale anche con bambini.",
    flightTime: "2h 25m",
    suggestedFlights: `
      Ryanair FR7456 – Bergamo → Porto<br>
      EasyJet U24311 – Malpensa → Porto
    `,
    skyscanner: "https://www.skyscanner.it/trasporti/voli/it/opo/",
    gflights: "https://www.google.com/travel/flights?q=milano%20porto",
    momondo: "https://www.momondo.it/volo/milano/porto-opo"
  },

  {
    name: "Creta, Grecia",
    area: "europe",
    type: "sea",
    vibe: "relax",
    budget: "mid",
    lat: 35.3387,
    lon: 25.1442,
    code: "HER",
    familyScore: 9,
    flightHours: 2.7,
    tagline: "Mare, relax, cibo ottimo. Family-friendly.",
    flightTime: "2h 35m",
    suggestedFlights: `
      Aegean A3 613 – MXP → Heraklion<br>
      Ryanair FR3412 – BGY → Chania
    `,
    skyscanner: "https://www.skyscanner.it/trasporti/voli/it/her/",
    gflights: "https://www.google.com/travel/flights?q=milano%20creta",
    momondo: "https://www.momondo.it/volo/milano/creta"
  },

  {
    name: "Interlaken, Svizzera",
    area: "europe",
    type: "mountain",
    vibe: "adventure",
    budget: "high",
    lat: 46.6863,
    lon: 7.8632,
    code: "BRN",
    familyScore: 6,
    flightHours: 1.2,
    tagline: "Natura, laghi e montagne. Perfetta per attività outdoor.",
    flightTime: "1h + treno",
    suggestedFlights: `
      Swiss LX317 – Malpensa → Berna<br>
      Treno diretto da Milano Centrale
    `,
    skyscanner: "https://www.skyscanner.it/trasporti/voli/it/brn/",
    gflights: "https://www.google.com/travel/flights?q=milano%20berna",
    momondo: "https://www.momondo.it/volo/milano/berna"
  }
];


/* -------------------------------------------------------
   TRAVEL SCORE – punteggio intelligente
-------------------------------------------------------- */

function computeTravelScore(dest, filters) {
  let score = 50;

  const {
    duration,
    budget,
    children,
    type,
    vibe,
    period,
    tripLengthDays
  } = filters;

  if (dest.budget === budget) score += 12;
  else if (budget === "low" && dest.budget === "high") score -= 10;

  if (children > 0) score += dest.familyScore * 0.7;

  if (type !== "all" && dest.type === type) score += 8;
  if (vibe !== "all" && dest.vibe === vibe) score += 8;

  if (period === "summer" && dest.type === "sea") score += 5;

  if (tripLengthDays) {
    if (duration === "weekend" && tripLengthDays <= 3) score += 10;
    if (duration === "week" && tripLengthDays <= 9) score += 10;
  }

  return score;
}


/* -------------------------------------------------------
   CARD CREATION (meteo + prezzo reale)
-------------------------------------------------------- */

async function createCardWithAPI(dest, originCode, departDate, returnDate) {
  const weather = await getRealWeather(dest.lat, dest.lon);
  const price = await getFlightPriceByDate(originCode, dest.code, departDate, returnDate);

  return `
    <div class="card fade-in-up">

      <h3 class="card-title">${dest.name}</h3>
      <p class="card-tagline">${dest.tagline}</p>

      <p class="card-meta">
        🌤 <b>Meteo:</b> ${weather}<br>
        💶 <b>Prezzo A/R per le tue date:</b> ${price}<br>
        ✈️ <b>Durata volo:</b> ${dest.flightTime}<br>
        👨‍👩‍👧 <b>Family score:</b> ${dest.familyScore}/10
      </p>

      <h4 class="card-subtitle">Voli suggeriti</h4>
      <p class="card-meta">${dest.suggestedFlights}</p>

      <h4 class="card-subtitle">Dove puoi prenotare</h4>
      <p class="card-meta">
        <a href="${dest.skyscanner}" target="_blank">🌍 Skyscanner</a><br>
        <a href="${dest.gflights}" target="_blank">✈ Google Flights</a><br>
        <a href="${dest.momondo}" target="_blank">🔎 Momondo</a>
      </p>

    </div>
  `;
}


/* -------------------------------------------------------
   MOTORE DI RICERCA PRINCIPALE
-------------------------------------------------------- */

const tripForm = document.getElementById("tripForm");

tripForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const airport = document.getElementById("airport").value;
  const area = document.getElementById("area").value;
  const budget = document.getElementById("budget").value;
  const duration = document.getElementById("duration").value;
  const type = document.getElementById("type").value;
  const vibe = document.getElementById("vibe").value;
  const children = parseInt(document.getElementById("children").value || "0");
  const period = document.getElementById("period").value;

  const departDate = document.getElementById("startDate").value;
  const returnDate = document.getElementById("endDate").value;

  const missing = [];
  if (!airport) missing.push("aeroporto");
  if (!area) missing.push("area");
  if (!budget) missing.push("budget");
  if (!duration) missing.push("durata");

  if (missing.length > 0) {
    alert("Per iniziare servono:\n- " + missing.join("\n- "));
    return;
  }

  if (!departDate || !returnDate) {
    alert("Inserisci le date di partenza e ritorno.");
    return;
  }

  const start = new Date(departDate);
  const end = new Date(returnDate);
  const tripLengthDays = Math.round((end - start) / 86400000) + 1;

  showLoader();

  let results = destinationsData.filter(dest => {
    if (area === "europe" && dest.area !== "europe") return false;
    if (area === "world") {} 
    if (type !== "all" && dest.type !== type) return false;
    if (vibe !== "all" && dest.vibe !== vibe) return false;
    return dest.budget === budget;
  });

  if (results.length === 0) {
    results = destinationsData.filter(dest => dest.budget === budget);
  }

  const filters = { duration, budget, children, type, vibe, period, tripLengthDays };
  results = results
    .map(d => ({ dest: d, score: computeTravelScore(d, filters) }))
    .sort((a, b) => b.score - a.score);

  const container = document.getElementById("cardsContainer");

  let html = "";
  for (const item of results) {
    html += await createCardWithAPI(item.dest, airport, departDate, returnDate);
  }

  container.innerHTML = html;
});


