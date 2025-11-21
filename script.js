/* -------------------------------------------------------
   SAFE TRAVEL – SCRIPT JS FINALE
   - index.html: gestisce i filtri e fa redirect a results.html
   - results.html: legge i filtri, chiama API reali,
     genera le destinazioni (top + griglia)
-------------------------------------------------------- */


/* -----------------------------
   NAV MENU (MOBILE)
----------------------------- */
const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });
}


/* -------------------------------------------------------
   FUNZIONE UTILE: LEGGI PARAMETRI DALLA URL
-------------------------------------------------------- */
function getQueryParams() {
  return new URLSearchParams(window.location.search);
}


/* -------------------------------------------------------
   1) LOGICA PER index.html → REDIRECT A results.html
-------------------------------------------------------- */

const tripForm = document.getElementById("tripForm");

if (tripForm) {
  tripForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const airport  = document.getElementById("airport").value;
    const area     = document.getElementById("area").value;
    const budget   = document.getElementById("budget").value;
    const duration = document.getElementById("duration").value;
    const start    = document.getElementById("startDate").value;
    const end      = document.getElementById("endDate").value;

    const type     = document.getElementById("type").value;
    const vibe     = document.getElementById("vibe").value;
    const children = document.getElementById("children").value || "0";
    const period   = document.getElementById("period").value;

    const missing = [];
    if (!airport)  missing.push("aeroporto di partenza");
    if (!area)     missing.push("area");
    if (!budget)   missing.push("budget");
    if (!duration) missing.push("durata del viaggio");
    if (!start)    missing.push("data di partenza");
    if (!end)      missing.push("data di ritorno");

    if (missing.length > 0) {
      alert("Per iniziare ho bisogno di:\n- " + missing.join("\n- "));
      return;
    }

    const params = new URLSearchParams();
    params.set("airport", airport);
    params.set("area", area);
    params.set("budget", budget);
    params.set("duration", duration);
    params.set("start", start);
    params.set("end", end);

    params.set("type", type);
    params.set("vibe", vibe);
    params.set("children", children);
    params.set("period", period);

    window.location.href = "results.html?" + params.toString();
  });
}


/* -------------------------------------------------------
   2) LOGICA PER results.html → GENERARE RISULTATI
-------------------------------------------------------- */

const isResultsPage = window.location.pathname.endsWith("results.html") || 
                      document.getElementById("appliedFilters");

if (isResultsPage) {

  /* -----------------------------
     COSTANTI & API
  ----------------------------- */

  const TP_TOKEN = "02dd565a82ec75665c68543e34abc5d6";

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

  async function loadRealDestinations(origin) {
    // default se utente ha scelto "Non lo so" sull'aeroporto
    if (origin === "donotknow") origin = "MIL";

    const url =
      `https://api.travelpayouts.com/v3/prices/cheap?origin=${origin}` +
      `&currency=EUR&token=${TP_TOKEN}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.data) return [];

    return Object.entries(json.data).map(([iata, info]) => ({
      iata,
      price: info.price,
      airline: info.airline,
      departure_at: info.departure_at,
      return_at: info.return_at,
      transfers: info.transfers
    }));
  }

  async function getCityInfo(iata) {
    try {
      const url = `https://places.aviasales.ru/v2/places.json?code=${iata}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data || !data[0]) return null;

      const c = data[0];

      const europeCountries = [
        "Italy","France","Spain","Portugal","Greece","Germany","Austria","Switzerland",
        "Malta","Croatia","Slovenia","Hungary","Poland","Czechia","Czech Republic",
        "Belgium","Netherlands","Denmark","Sweden","Norway","Finland",
        "United Kingdom","UK","Ireland","Iceland"
      ];

      return {
        name: c.name || iata,
        lat: c.coordinates.lat,
        lon: c.coordinates.lon,
        country: c.country_name,
        isEurope: europeCountries.includes(c.country_name)
      };
    } catch {
      return null;
    }
  }


  /* -----------------------------
     CLASSIFICAZIONE SEMPLICE
  ----------------------------- */
  function classifyDestination(lat, lon) {
    if (lat > 44) return "mountain";
    if (lat < 40) return "sea";
    if (lat < 42 && lon > 20) return "sea";
    return "city";
  }


  /* -----------------------------
     TRAVEL SCORE
  ----------------------------- */
  function computeScore(dest, filters) {
    let score = 50;

    const { area, budget, duration, type, children } = filters;

    // budget vs prezzo
    if (budget === "low" && dest.price <= 200) score += 12;
    if (budget === "low" && dest.price > 350) score -= 10;
    if (budget === "mid" && dest.price >= 150 && dest.price <= 600) score += 8;
    if (budget === "high") score += 5;

    // area (Europa / mondo)
    if (area === "europe" && dest.isEurope) score += 10;
    if (area === "europe" && !dest.isEurope) score -= 15;

    // tipo destinazione
    if (type !== "all" && dest.category === type) score += 8;

    // durata (penalizza voli lunghi per weekend)
    if (duration === "weekend" && dest.flightHours && dest.flightHours > 3) {
      score -= 8;
    }

    // bambini
    if (children > 0 && dest.category === "sea") score += 5;

    return score;
  }


  /* -----------------------------
     CARD PREMIUM (TOP 2)
  ----------------------------- */
  async function createPremiumCard(dest, origin, departDate, returnDate) {
    const weather = await getWeather(dest.lat, dest.lon);
    const price = await getARPrice(origin, dest.iata, departDate, returnDate);

    return `
      <article class="card card-premium">
        <div class="card-premium-header">
          <h3 class="card-title">${dest.name}</h3>
          <p class="card-country">${dest.country}</p>
        </div>

        <p class="card-tagline">
          Meta selezionata in base al tuo budget, all’area scelta e alle date indicate.
        </p>

        <p class="card-meta">
          🌤 <b>Meteo (prossimi giorni):</b> ${weather}<br>
          💶 <b>Prezzo A/R stimato per le tue date:</b> ${price}<br>
          ✈️ <b>Codice aeroporto:</b> ${dest.iata}<br>
          🏷 <b>Categoria:</b> ${dest.category === "sea" ? "Mare" : dest.category === "mountain" ? "Montagna" : "Città"}
        </p>

        <a class="btn-primary"
          target="_blank"
          href="https://www.google.com/travel/flights?q=${origin}%20${dest.iata}">
          Apri in Google Flights →
        </a>
      </article>
    `;
  }


  /* -----------------------------
     CARD NORMALE (GRIGLIA)
  ----------------------------- */
  async function createGridCard(dest, origin, departDate, returnDate) {
    const weather = await getWeather(dest.lat, dest.lon);
    const price = await getARPrice(origin, dest.iata, departDate, returnDate);

    return `
      <article class="card">
        <h3 class="card-title">${dest.name}</h3>
        <p class="card-country">${dest.country}</p>

        <p class="card-meta">
          💶 <b>A/R stimato:</b> ${price}<br>
          🌤 <b>Meteo:</b> ${weather}<br>
          🏷 <b>Categoria:</b> ${dest.category}
        </p>

        <a class="btn-secondary"
          target="_blank"
          href="https://www.google.com/travel/flights?q=${origin}%20${dest.iata}">
          Vedi i voli →
        </a>
      </article>
    `;
  }


  /* -----------------------------
     POPOLA RIEPILOGO FILTRI
  ----------------------------- */
  function renderFiltersSummary(params) {
    const box = document.getElementById("appliedFilters");
    if (!box) return;

    const areaMap = {
      europe: "Solo Europa",
      world: "Mondo intero",
      any: "Nessuna preferenza"
    };

    const budgetMap = {
      low: "Basso (&lt; 300€)",
      mid: "Medio (300–700€)",
      high: "Alto (&gt; 700€)"
    };

    const durationMap = {
      weekend: "Weekend (1–3 giorni)",
      week: "1 settimana",
      twoweeks: "2 settimane",
      month: "1 mese"
    };

    const typeMap = {
      all: "Qualsiasi",
      sea: "Mare",
      mountain: "Montagna",
      city: "Città"
    };

    const vibeMap = {
      all: "Qualsiasi",
      relax: "Relax",
      adventure: "Avventura",
      culture: "Cultura",
      family: "Family",
      romantic: "Romantico"
    };

    const airport = params.get("airport") || "-";
    const area    = areaMap[params.get("area")] || "-";
    const budget  = budgetMap[params.get("budget")] || "-";
    const duration= durationMap[params.get("duration")] || "-";
    const type    = typeMap[params.get("type") || "all"];
    const vibe    = vibeMap[params.get("vibe") || "all"];
    const children= params.get("children") || "0";
    const period  = params.get("period") || "Qualsiasi";
    const start   = params.get("start") || "-";
    const end     = params.get("end") || "-";

    box.innerHTML = `
      <div class="filters-summary-inner">
        <h3>Filtri applicati</h3>
        <p>
          ✈ <b>Aeroporto:</b> ${airport}<br>
          🌍 <b>Area:</b> ${area}<br>
          💶 <b>Budget:</b> ${budget}<br>
          📆 <b>Date:</b> ${start} → ${end}<br>
          ⏱ <b>Durata:</b> ${duration}<br>
          🏷 <b>Tipo:</b> ${type}<br>
          🎭 <b>Stile viaggio:</b> ${vibe}<br>
          👶 <b>Bambini:</b> ${children}<br>
          🕒 <b>Periodo indicativo:</b> ${period}
        </p>
      </div>
    `;
  }


  /* -----------------------------
     FUNZIONE PRINCIPALE RISULTATI
  ----------------------------- */
  async function initResults() {
    const params = getQueryParams();

    const airport  = params.get("airport");
    const area     = params.get("area");
    const budget   = params.get("budget");
    const duration = params.get("duration");
    const start    = params.get("start");
    const end      = params.get("end");

    if (!airport || !area || !budget || !duration || !start || !end) {
      alert("I parametri della ricerca non sono completi. Torna alla home e riprova.");
      window.location.href = "index.html";
      return;
    }

    // Riepilogo filtri
    renderFiltersSummary(params);

    const type     = params.get("type") || "all";
    const vibe     = params.get("vibe") || "all";
    const children = parseInt(params.get("children") || "0", 10);
    const period   = params.get("period") || "any";

    const topContainer  = document.getElementById("topCards");
    const gridContainer = document.getElementById("gridResults");

    if (topContainer) {
      topContainer.innerHTML = `<p class="loader-text">Sto analizzando i dati reali delle destinazioni…</p>`;
    }
    if (gridContainer) {
      gridContainer.innerHTML = "";
    }

    // 1) Carica destinazioni reali dall'aeroporto scelto
    let raw;
    try {
      raw = await loadRealDestinations(airport);
    } catch (e) {
      console.error(e);
      if (topContainer) {
        topContainer.innerHTML = "<p>Non riesco a recuperare le destinazioni. Riprova più tardi.</p>";
      }
      return;
    }

    if (!raw || raw.length === 0) {
      if (topContainer) {
        topContainer.innerHTML = "<p>Nessuna destinazione trovata per questa combinazione.</p>";
      }
      return;
    }

    // 2) Arricchisci con info destinazione (città, paese, coordinate)
    const enriched = [];
    for (const d of raw.slice(0, 80)) {
      const info = await getCityInfo(d.iata);
      if (!info) continue;

      const category = classifyDestination(info.lat, info.lon);

      // euristica ore volo (non abbiamo l'esatto flight time)
      let flightHours = null;
      if (d.distance) {
        flightHours = d.distance / 700;
      }

      enriched.push({
        ...d,
        name: info.name,
        country: info.country,
        lat: info.lat,
        lon: info.lon,
        isEurope: info.isEurope,
        category,
        flightHours
      });
    }

    // 3) Filtri utente
    const filtered = enriched.filter(d => {
      if (area === "europe" && !d.isEurope) return false;
      if (area === "world") { /* tutto ok */ }
      if (type !== "all" && d.category !== type) return false;
      // vibe per ora non filtra in modo "pesante", lo useremo in future versioni
      return true;
    });

    if (!filtered.length) {
      if (topContainer) {
        topContainer.innerHTML = "<p>Nessuna destinazione coerente trovata. Prova ad allargare i filtri.</p>";
      }
      return;
    }

    // 4) Calcolo TravelScore
    const filtersForScore = { area, budget, duration, type, children, period };
    const scored = filtered
      .map(d => ({
        ...d,
        travelScore: computeScore(d, filtersForScore)
      }))
      .sort((a, b) => b.travelScore - a.travelScore);

    // 5) Suddividi: top 2 + resto
    const top2 = scored.slice(0, 2);
    const rest = scored.slice(2, 12); // massimo 10 altre

    // 6) Render top 2
    let topHtml = "";
    for (const t of top2) {
      topHtml += await createPremiumCard(t, airport === "donotknow" ? "MIL" : airport, start, end);
    }
    if (topContainer) topContainer.innerHTML = topHtml;

    // 7) Render griglia resto
    let gridHtml = "";
    for (const r of rest) {
      gridHtml += await createGridCard(r, airport === "donotknow" ? "MIL" : airport, start, end);
    }
    if (gridContainer) gridContainer.innerHTML = gridHtml;
  }


  // Avvia logica risultati
  initResults();
}
