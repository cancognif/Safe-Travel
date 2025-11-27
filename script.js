/* ===============================
   SAFE TRAVEL – SCRIPT FINALE
   =============================== */

/**
 * DATABASE INTERNO DI DESTINAZIONI
 * (puoi aggiungere / modificare mete da qui)
 */
const DESTINATIONS = [
  {
    id: "valencia",
    name: "Valencia",
    country: "Spagna",
    continent: "EU",
    areaGroup: "europe",
    tags: ["sea", "city", "weekend", "family"],
    priceFrom: 180,
    bestMonths: [3,4,5,9,10],
    scoreBase: 88
  },
  {
    id: "porto",
    name: "Porto",
    country: "Portogallo",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "weekend", "culture"],
    priceFrom: 170,
    bestMonths: [3,4,5,9,10],
    scoreBase: 86
  },
  {
    id: "faro",
    name: "Faro (Algarve)",
    country: "Portogallo",
    continent: "EU",
    areaGroup: "europe",
    tags: ["sea", "relax", "family"],
    priceFrom: 220,
    bestMonths: [5,6,9,10],
    scoreBase: 87
  },
  {
    id: "lisbona",
    name: "Lisbona",
    country: "Portogallo",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "week", "culture"],
    priceFrom: 210,
    bestMonths: [3,4,5,9,10],
    scoreBase: 89
  },
  {
    id: "atene",
    name: "Atene",
    country: "Grecia",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "culture", "week"],
    priceFrom: 200,
    bestMonths: [4,5,9,10],
    scoreBase: 90
  },
  {
    id: "creta",
    name: "Creta",
    country: "Grecia",
    continent: "EU",
    areaGroup: "europe",
    tags: ["sea", "week", "family"],
    priceFrom: 260,
    bestMonths: [5,6,9],
    scoreBase: 85
  },
  {
    id: "canarie",
    name: "Isole Canarie",
    country: "Spagna",
    continent: "EU",
    areaGroup: "world",
    tags: ["sea", "winter_sun", "family", "long"],
    priceFrom: 280,
    bestMonths: [1,2,11,12],
    scoreBase: 91
  },
  {
    id: "madeira",
    name: "Madeira",
    country: "Portogallo",
    continent: "EU",
    areaGroup: "world",
    tags: ["sea", "nature", "long"],
    priceFrom: 320,
    bestMonths: [4,5,9,10],
    scoreBase: 87
  },
  {
    id: "budapest",
    name: "Budapest",
    country: "Ungheria",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "weekend", "culture"],
    priceFrom: 160,
    bestMonths: [3,4,5,9,10,11],
    scoreBase: 84
  },
  {
    id: "dublino",
    name: "Dublino",
    country: "Irlanda",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "weekend"],
    priceFrom: 240,
    bestMonths: [4,5,6,9],
    scoreBase: 82
  },
  {
    id: "edimburgo",
    name: "Edimburgo",
    country: "Regno Unito",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "culture", "week"],
    priceFrom: 230,
    bestMonths: [5,6,8,9],
    scoreBase: 83
  },
  {
    id: "parigi",
    name: "Parigi",
    country: "Francia",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "romantic", "weekend"],
    priceFrom: 220,
    bestMonths: [3,4,5,9,10],
    scoreBase: 88
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    country: "Paesi Bassi",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "weekend"],
    priceFrom: 230,
    bestMonths: [4,5,6,9],
    scoreBase: 85
  },
  {
    id: "praga",
    name: "Praga",
    country: "Repubblica Ceca",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "weekend", "culture"],
    priceFrom: 170,
    bestMonths: [3,4,5,9,10,12],
    scoreBase: 84
  },
  {
    id: "vienna",
    name: "Vienna",
    country: "Austria",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "culture", "week"],
    priceFrom: 210,
    bestMonths: [3,4,5,9,12],
    scoreBase: 83
  },
  {
    id: "sardegna",
    name: "Nord Sardegna",
    country: "Italia",
    continent: "EU",
    areaGroup: "europe",
    tags: ["sea", "family", "summer"],
    priceFrom: 250,
    bestMonths: [6,7,9],
    scoreBase: 86
  },
  {
    id: "dolomiti",
    name: "Dolomiti",
    country: "Italia",
    continent: "EU",
    areaGroup: "europe",
    tags: ["mountain", "nature", "winter", "family"],
    priceFrom: 260,
    bestMonths: [1,2,12],
    scoreBase: 88
  },
  {
    id: "malaga",
    name: "Malaga",
    country: "Spagna",
    continent: "EU",
    areaGroup: "europe",
    tags: ["sea", "city", "weekend"],
    priceFrom: 190,
    bestMonths: [4,5,6,9,10],
    scoreBase: 85
  },
  {
    id: "sevilla",
    name: "Siviglia",
    country: "Spagna",
    continent: "EU",
    areaGroup: "europe",
    tags: ["city", "culture", "weekend"],
    priceFrom: 180,
    bestMonths: [3,4,5,10],
    scoreBase: 86
  }
];

/* -------------------------------
   LETTURA FILTRI DA URL
-------------------------------- */
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    airport: params.get("airport"),
    startDate: params.get("startDate"),
    endDate: params.get("endDate"),
    area: params.get("area"),
    budget: params.get("budget"),
    duration: params.get("duration"),
    children: params.get("children")
  };
}

/* -------------------------------
   CALCOLO TRAVELSCORE
-------------------------------- */
function computeScore(destination, filters) {
  let score = destination.scoreBase || 80;

  const { area, budget, duration, children, month } = filters;
  const childrenNum = children ? parseInt(children, 10) || 0 : 0;

  // Area generale
  if (area === "europe" && destination.areaGroup === "europe") {
    score += 6;
  } else if (area === "world") {
    score += 2; // accettiamo tutto
  }

  // Area "tema" (mare / città / montagna)
  if (area === "sea" && destination.tags.includes("sea")) score += 8;
  if (area === "city" && destination.tags.includes("city")) score += 8;
  if (area === "mountain" && destination.tags.includes("mountain")) score += 8;

  // Budget
  if (budget === "low") {
    if (destination.priceFrom <= 220) score += 8;
    else if (destination.priceFrom <= 280) score += 2;
    else score -= 8;
  }
  if (budget === "mid") {
    if (destination.priceFrom >= 180 && destination.priceFrom <= 350) score += 6;
  }
  if (budget === "high") {
    if (destination.priceFrom >= 250) score += 4;
  }

  // Durata
  if (duration === "weekend" && destination.tags.includes("weekend")) score += 6;
  if (duration === "week" && destination.tags.includes("week")) score += 6;
  if (duration === "long" && destination.tags.includes("long")) score += 6;

  // Bambini
  if (childrenNum > 0) {
    if (destination.tags.includes("family")) score += 8;
    else score -= 6;
  }

  // Stagionalità (mese di partenza)
  if (month && Array.isArray(destination.bestMonths) && destination.bestMonths.length) {
    if (destination.bestMonths.includes(month)) {
      score += 8;
    } else {
      score -= 4;
    }
  }

  // Clamp
  if (score > 100) score = 100;
  if (score < 10) score = 10;

  return Math.round(score);
}

/* -------------------------------
   GESTIONE FORM IN INDEX.HTML
-------------------------------- */
const form = document.getElementById("tripForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const airport = document.getElementById("airport").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const area = document.getElementById("area").value;
    const budget = document.getElementById("budget").value;
    const duration = document.getElementById("duration").value;
    const children = document.getElementById("children").value || "0";

    if (!airport || !startDate || !endDate || !area || !budget || !duration) {
      alert("Compila tutti i campi obbligatori contrassegnati con *.");
      return;
    }

    const params = new URLSearchParams({
      airport,
      startDate,
      endDate,
      area,
      budget,
      duration,
      children
    });

    window.location.href = results.html?${params.toString()};
  });
}

/* -------------------------------
   GENERAZIONE RISULTATI
-------------------------------- */
function generateResults() {
  const grid = document.getElementById("gridResults");
  const top = document.getElementById("topCards");
  const statusEl = document.getElementById("statusMessage");

  // Se non siamo su results.html, esco
  if (!grid || !top) return;

  const filters = getQueryParams();

  if (!filters.airport) {
    if (statusEl) {
      statusEl.textContent = "Per vedere i risultati, compila i filtri dalla homepage.";
    }
    return;
  }

  if (statusEl) {
    statusEl.textContent = "Sto analizzando le destinazioni in base ai tuoi filtri…";
  }

  // Mese di partenza (1–12)
  let month = null;
  if (filters.startDate) {
    const d = new Date(filters.startDate + "T12:00:00");
    if (!isNaN(d.getTime())) {
      month = d.getMonth() + 1;
    }
  }

  // Calcoliamo punteggi
  const withScores = DESTINATIONS.map(dest => {
    const score = computeScore(dest, { ...filters, month });
    return { ...dest, score };
  });

  // Filtriamo le mete proprio irrilevanti
  let filtered = withScores.filter(d => d.score >= 40);

  if (!filtered.length) {
    if (statusEl) {
      statusEl.textContent =
        "Con questi filtri non trovo mete adatte. Prova ad allargare budget o area.";
    }
    top.innerHTML = "";
    grid.innerHTML = "";
    return;
  }

  // Ordine per punteggio
  filtered.sort((a, b) => b.score - a.score);

  const top3 = filtered.slice(0, 3);
  const others = filtered.slice(3);

  // RENDER TOP
  top.innerHTML = top3
    .map(d => {
      return `
        <div class="card">
          <h3 class="card-title">${d.name}, ${d.country}</h3>
          <span class="card-score">⭐ TravelScore ${d.score}/100</span>
          <p class="card-meta">
            Indicativamente da €${d.priceFrom} a persona (volo + base).
          </p>
          <p class="card-tagline">
            Perfetta per: ${renderTags(d.tags)}
          </p>
          <p class="card-meta small">
            Consiglio: cerca voli da ${filters.airport || "il tuo aeroporto"} su Skyscanner o Google Flights.
          </p>
        </div>
      `;
    })
    .join("");

  // RENDER OTHERS
  if (others.length) {
    grid.innerHTML = others
      .map(d => {
        return `
          <div class="card">
            <h3 class="card-title">${d.name}, ${d.country}</h3>
            <span class="card-score">⭐ ${d.score}/100</span>
            <p class="card-meta">
              Indicativamente da €${d.priceFrom} a persona.
            </p>
            <p class="card-tagline">
              Ideale se cerchi: ${renderTags(d.tags)}
            </p>
          </div>
        `;
      })
      .join("");
  } else {
    grid.innerHTML = `
      <p class="no-more">
        Hai già visto le mete migliori per i tuoi filtri. Prova a modificare budget o durata per alternative diverse.
      </p>
    `;
  }

  if (statusEl) {
    statusEl.textContent =
      "Ecco le mete che si adattano di più ai tuoi filtri (versione MVP, prezzi indicativi basati sui dati).";
  }
}

// Helper per rendere i tag in modo “umano”
function renderTags(tags) {
  if (!tags || !tags.length) return "viaggio versatile";
  const mapping = {
    sea: "mare",
    city: "città",
    mountain: "montagna",
    family: "famiglia",
    weekend: "weekend",
    week: "settimana",
    long: "viaggio lungo",
    culture: "cultura",
    romantic: "romantico",
    nature: "natura",
    winter_sun: "sole d'inverno",
    summer: "estate"
  };

  const readable = tags
    .filter(t => mapping[t])
    .map(t => mapping[t]);

  if (!readable.length) return "viaggio versatile";
  return readable.join(", ");
}

// Avvia solo se siamo su results.html
generateResults();
