
   /* -------------------------------------------------------
       SAFE TRAVEL – SCRIPT COMPLETO FINALE
   ------------------------------------------------------- */


/* -----------------------------
   MENU MOBILE
----------------------------- */
document.getElementById("navToggle").addEventListener("click", () => {
  document.querySelector(".nav-menu").classList.toggle("open");
});


/* -----------------------------
   LOADER DURANTE LA RICERCA
----------------------------- */
function showLoader() {
  document.getElementById("cardsContainer").innerHTML =
    `<div class="loader" style="
      font-size:16px;
      padding:20px;
      text-align:center;
      color:#2A3F73;
    ">Analizzo i dati reali…</div>`;
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
    console.error("Errore meteo:", e);
    return "Meteo non disponibile";
  }
}


/* -----------------------------
   API VOLI – TRAVELPAYOUTS
----------------------------- */

// INSERISCI LA TUA KEY QUI
const TRAVELPAYOUTS_TOKEN = "INSERISCI_LA_TUA_API_KEY";

async function getFlightPrice(origin, destinationCode) {
  const url =
    `https://api.travelpayouts.com/v2/prices/latest?currency=EUR` +
    `&origin=${origin}&destination=${destinationCode}&token=${TRAVELPAYOUTS_TOKEN}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      return "Prezzo non disponibile";
    }

    return data.data[0].value + " €";
  } catch (e) {
    console.error("Errore prezzo volo:", e);
    return "Prezzo non disponibile";
  }
}


/* -------------------------------------------------------
   DATABASE DESTINAZIONI – VERSIONE COMPLETA
------------------------------------------------------- */

const destinationsData = [

  /* 🌆 PORTO */
  {
    name: "Porto, Portogallo",
    area: "europe",
    type: "city",
    vibe: "culture",
    budget: "mid",
    lat: 41.1579,
    lon: -8.6291,
    code: "OPO",
    tagline: "Perfetta per primavera e weekend lunghi.",
    flightTime: "2h 25m",
    suggestedFlights: `
      Ryanair FR7456 – Milano Bergamo → Porto<br>
      EasyJet U24311 – Milano Malpensa → Porto
    `,
    skyscanner: "https://www.skyscanner.it/trasporti/voli/it/opo/",
    gflights: "https://www.google.com/travel/flights?q=milano%20porto",
    momondo: "https://www.momondo.it/volo/milano/porto-opo"
  },

  /* 🌊 CRETA */
  {
    name: "Creta, Grecia",
    area: "europe",
    type: "sea",
    vibe: "relax",
    budget: "mid",
    lat: 35.3387,
    lon: 25.1442,
    code: "HER",
    tagline: "Ideale per mare, relax e ottimo cibo.",
    flightTime: "2h 35m",
    suggestedFlights: `
      Aegean A3 613 – Milano Malpensa → Heraklion<br>
      Ryanair FR3412 – Bergamo → Chania
    `,
    skyscanner: "https://www.skyscanner.it/trasporti/voli/it/her/",
    gflights: "https://www.google.com/travel/flights?q=milano%20creta",
    momondo: "https://www.momondo.it/volo/milano/creta"
  },

  /* 🏔️ INTERLAKEN */
  {
    name: "Interlaken, Svizzera",
    area: "europe",
    type: "mountain",
    vibe: "adventure",
    budget: "high",
    lat: 46.6863,
    lon: 7.8632,
    code: "BRN", 
    tagline: "Perfetta per natura, laghi e montagne.",
    flightTime: "1h 10m",
    suggestedFlights: `
      Swiss LX317 – Milano Malpensa → Berna<br>
      Treno consigliato da Milano Centrale
    `,
    skyscanner: "https://www.skyscanner.it/trasporti/voli/it/brn/",
    gflights: "https://www.google.com/travel/flights?q=milano%20berna",
    momondo: "https://www.momondo.it/volo/milano/berna"
  }
];


/* -------------------------------------------------------
   CREAZIONE CARD COMPLETA (API METEO + API VOLI)
------------------------------------------------------- */

async function createCardWithAPI(dest) {
  const weather = await getRealWeather(dest.lat, dest.lon);
  const price = await getFlightPrice("MIL", dest.code);

  return `
    <div class="card fade-in-up">

      <h3 class="card-title">${dest.name}</h3>

      <p class="card-tagline">${dest.tagline}</p>

      <p class="card-meta">
        🌤 <b>Meteo reale:</b> ${weather}<br>
        💶 <b>Prezzo volo:</b> ${price}<br>
        ✈️ <b>Durata volo:</b> ${dest.flightTime}<br>
      </p>

      <h4 class="card-subtitle">Voli suggeriti</h4>
      <p class="card-meta">${dest.suggestedFlights}</p>

      <h4 class="card-subtitle">Cerca il volo</h4>
      <p class="card-meta links">
        <a href="${dest.skyscanner}" target="_blank">🌍 Skyscanner</a><br>
        <a href="${dest.gflights}"  target="_blank">✈ Google Flights</a><br>
        <a href="${dest.momondo}"   target="_blank">🔎 Momondo</a>
      </p>

    </div>
  `;
}


/* -------------------------------------------------------
   MOTORE DI FILTRAGGIO COMPLETO
------------------------------------------------------- */

document.getElementById("tripForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  showLoader();

  const area = document.getElementById("area").value;
  const type = document.getElementById("type")?.value || "all";
  const budget = document.getElementById("budget").value;
  const vibe = document.getElementById("vibe").value;

  const results = destinationsData.filter(dest => {

    // AREA: Europa / mondo
    const matchArea =
      area === "world" || dest.area === area;

    // TIPOLOGIA: mare, montagna, città
    const matchType =
      type === "all" || dest.type === type;

    // VIBE: relax, romantic, adventure
    const matchVibe =
      vibe === "all" || dest.vibe === vibe;

    // BUDGET
    const matchBudget =
      dest.budget === budget;

    return matchArea && matchType && matchVibe && matchBudget;
  });

  const container = document.getElementById("cardsContainer");

  if (results.length === 0) {
    container.innerHTML =
      "<p>Nessun risultato trovato. Prova a cambiare i filtri.</p>";
    return;
  }

  // CREA CARD
  let html = "";
  for (const dest of results) {
    html += await createCardWithAPI(dest);
  }

  container.innerHTML = html;
});

