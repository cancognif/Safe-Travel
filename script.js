/* -------------------------------------------------------
   SAFE TRAVEL – SCRIPT COMPLETO FINALE (API REALI)
   Filtri obbligatori + opzionali + family + date
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
   LOADER DURANTE LA RICERCA
----------------------------- */
function showLoader() {
  const container = document.getElementById("cardsContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="loader" style="
      font-size:16px;
      padding:20px;
      text-align:center;
      color:#2A3F73;
    ">
      Sto analizzando i dati reali per te…
    </div>
  `;
}


/* -----------------------------
   API METEO – OPEN METEO
   (per ora usiamo il meteo dei prossimi giorni,
    non ancora legato esattamente alle date scelte)
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
   (prezzi indicativi, endpoint latest)
----------------------------- */

/* ⭐ LA TUA API KEY PERSONALE */
const TRAVELPAYOUTS_TOKEN = "02dd565a82ec75665c68543e34abc5d6";

async function getFlightPrice(origin, destinationCode) {
  const url =
    `https://api.travelpayouts.com/v2/prices/latest` +
    `?currency=EUR&origin=${origin}&destination=${destinationCode}` +
    `&token=${TRAVELPAYOUTS_TOKEN}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return "Prezzo non disponibile";
    }

    const price = data.data[0].value;
    return price + " €";
  } catch (e) {
    console.error("Errore prezzo volo:", e);
    return "Prezzo non disponibile";
  }
}


/* -------------------------------------------------------
   DATABASE DESTINAZIONI – PUOI ESTENDERLO
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
    tagline: "Perfetta per weekend e primavera, ottima per coppie e famiglie.",
    flightTime: "2h 25m",
    suggestedFlights: `
      Ryanair FR7456 – Milano Bergamo → Porto<br>
      EasyJet U24311 – Milano Malpensa → Porto
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
    tagline: "Mare, relax e cibo ottimo. Ideale per famiglie e coppie.",
    flightTime: "2h 35m",
    suggestedFlights: `
      Aegean A3 613 – Milano Malpensa → Heraklion<br>
      Ryanair FR3412 – Bergamo → Chania
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
    tagline: "Natura, laghi e montagne. Ideale per chi ama muoversi all'aria aperta.",
    flightTime: "1h 10m + treno",
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
   TRAVEL SCORE – PUNTEGGIO INTELLIGENTE
   Usa durata, budget, bambini, tipo, vibe, periodo, giorni reali
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

  // 1) Budget
  if (dest.budget === budget) {
    score += 12;
  } else if (budget === "low" && dest.budget === "high") {
    score -= 10;
  } else if (budget === "high" && dest.budget === "low") {
    score -= 4;
  }

  // 2) Durata "teorica" (weekend, settimana, ecc.) vs ore volo
  if (duration === "weekend") {
    if (dest.flightHours <= 2.5) score += 12;
    else if (dest.flightHours > 4) score -= 8;
  } else if (duration === "week") {
    score += 3;
  } else if (duration === "twoweeks" || duration === "month") {
    if (dest.flightHours >= 3) score += 6;
  }

  // 3) Durata reale in giorni (se l'utente ha inserito le date)
  if (tripLengthDays && tripLengthDays > 0) {
    if (duration === "weekend") {
      if (tripLengthDays <= 3) score += 8;
      if (tripLengthDays > 5) score -= 6;
    } else if (duration === "week") {
      if (tripLengthDays >= 4 && tripLengthDays <= 9) score += 8;
    } else if (duration === "twoweeks") {
      if (tripLengthDays >= 10 && tripLengthDays <= 16) score += 8;
    } else if (duration === "month") {
      if (tripLengthDays >= 20) score += 8;
    }
  }

  // 4) Bambini
  if (children > 0) {
    score += dest.familyScore * 0.8;
  }

  // 5) Tipo destinazione (mare / montagna / città)
  if (type !== "all") {
    if (dest.type === type) {
      score += 8;
    } else {
      score -= 4;
    }
  }

  // 6) Vibe
  if (vibe !== "all") {
    if (dest.vibe === vibe) {
      score += 8;
    } else if (vibe === "family" && dest.familyScore >= 7) {
      score += 5;
    } else {
      score -= 2;
    }
  }

  // 7) Periodo (semplice, ma espandibile)
  if (period === "summer" && dest.type === "sea") {
    score += 5;
  }
  if (period === "winter" && dest.type === "mountain") {
    score += 5;
  }

  return score;
}


/* -------------------------------------------------------
   CREAZIONE CARD CON DATI REALI
-------------------------------------------------------- */

async function createCardWithAPI(dest, originCode) {
  const weather = await getRealWeather(dest.lat, dest.lon);
  const price = await getFlightPrice(originCode, dest.code);

  return `
    <div class="card fade-in-up">

      <h3 class="card-title">${dest.name}</h3>

      <p class="card-tagline">${dest.tagline}</p>

      <p class="card-meta">
        🌤 <b>Meteo reale prossimi giorni:</b> ${weather}<br>
        💶 <b>Prezzo indicativo volo da ${originCode}:</b> ${price}<br>
        ✈️ <b>Durata volo:</b> ${dest.flightTime}<br>
        👨‍👩‍👧 <b>Family score:</b> ${dest.familyScore}/10
      </p>

      <h4 class="card-subtitle">Voli suggeriti</h4>
      <p class="card-meta">
        ${dest.suggestedFlights}
      </p>

      <h4 class="card-subtitle">Dove puoi prenotare</h4>
      <p class="card-meta">
        <a href="${dest.skyscanner}" target="_blank">🌍 Cerca su Skyscanner</a><br>
        <a href="${dest.gflights}"  target="_blank">✈ Cerca su Google Flights</a><br>
        <a href="${dest.momondo}"   target="_blank">🔎 Cerca su Momondo</a>
      </p>

    </div>
  `;
}


/* -------------------------------------------------------
   HANDLER DEL FORM – MOTORE PRINCIPALE
-------------------------------------------------------- */

const tripForm = document.getElementById("tripForm");

if (tripForm) {
  tripForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const airport = document.getElementById("airport").value;
    const area = document.getElementById("area").value;
    const budget = document.getElementById("budget").value;
    const duration = document.getElementById("duration").value;

    const type = document.getElementById("type").value;
    const vibe = document.getElementById("vibe").value;
    const children = parseInt(document.getElementById("children").value || "0", 10);
    const period = document.getElementById("period").value;

    const startDateVal = document.getElementById("startDate")?.value || "";
    const endDateVal   = document.getElementById("endDate")?.value || "";

    // VALIDAZIONE FILTRI OBBLIGATORI
    const missing = [];
    if (!airport) missing.push("aeroporto di partenza");
    if (!area) missing.push("area");
    if (!budget) missing.push("budget");
    if (!duration) missing.push("durata del viaggio");

    if (missing.length > 0) {
      alert("Per iniziare ho bisogno di:\n- " + missing.join("\n- "));
      return;
    }

    // VALIDAZIONE DATE (se entrambe inserite)
    let tripLengthDays = null;
    if (startDateVal && endDateVal) {
      const start = new Date(startDateVal);
      const end = new Date(endDateVal);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        alert("Le date inserite non sono valide.");
        return;
      }

      if (end < start) {
        alert("La data di ritorno deve essere successiva alla data di partenza.");
        return;
      }

      const diffMs = end.getTime() - start.getTime();
      tripLengthDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusivo
    }

    showLoader();

    // NORMALIZZA AREA
    const normalizedArea = area === "any" ? "any" : area;

    // ORIGINE PER API VOLI
    let originCode = airport;
    if (airport === "donotknow") {
      originCode = "MIL"; // fallback se non sa da dove parte
    }

    // FILTRAGGIO BASE
    let results = destinationsData.filter(dest => {
      // Area
      let matchArea = true;
      if (normalizedArea === "europe") {
        matchArea = dest.area === "europe";
      } else if (normalizedArea === "world") {
        matchArea = true;
      } else if (normalizedArea === "any") {
        matchArea = true;
      }

      // Budget (obbligatorio)
      const matchBudget = dest.budget === budget;

      // Tipo (mare/montagna/città) opzionale
      const matchType = (type === "all") || (dest.type === type);

      // Vibe opzionale
      let matchVibe = true;
      if (vibe !== "all") {
        matchVibe = (dest.vibe === vibe) || (vibe === "family" && dest.familyScore >= 7);
      }

      return matchArea && matchBudget && matchType && matchVibe;
    });

    // Se non c'è nessun risultato, allargo: considero solo il budget
    if (results.length === 0) {
      results = destinationsData.filter(dest => dest.budget === budget);
    }

    const filtersForScore = {
      duration,
      budget,
      children,
      type,
      vibe,
      period,
      tripLengthDays
    };

    // CALCOLO TRAVEL SCORE E ORDINO
    const resultsWithScore = results
      .map(dest => ({
        dest,
        score: computeTravelScore(dest, filtersForScore)
      }))
      .sort((a, b) => b.score - a.score);

    const container = document.getElementById("cardsContainer");
    if (!container) return;

    if (resultsWithScore.length === 0) {
      container.innerHTML = "<p>Nessun risultato trovato. Prova a modificare i filtri.</p>";
      return;
    }

    // COSTRUISCO LE CARD CON API REALI
    let html = "";
    for (const item of resultsWithScore) {
      html += await createCardWithAPI(item.dest, originCode);
    }

    container.innerHTML = html;
  });
}

