/* ==========================================================
   SAFE TRAVEL – SCRIPT JS (VERSIONE FINALE "SMART RESULTS")
   - index.html → raccoglie filtri, redirect a results.html
   - results.html → chiama Netlify Functions, elabora mete
   - Nessun filtro rigido: sempre risultati (se API risponde)
========================================================== */


/* -------------------- MOBILE NAV ------------------------ */
const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });
}


/* -------------------- URL UTILITY ------------------------ */
function getQueryParams() {
  return new URLSearchParams(window.location.search);
}


/* ==========================================================
   1) INDEX.HTML → REDIRECT VERSO RESULTS.HTML
========================================================== */

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
    const period   = document.getElementById("period").value || "";

    const missing = [];
    if (!airport)  missing.push("l’aeroporto di partenza");
    if (!area)     missing.push("l’area");
    if (!budget)   missing.push("il budget");
    if (!duration) missing.push("la durata");
    if (!start)    missing.push("la data di partenza");
    if (!end)      missing.push("la data di ritorno");

    if (missing.length > 0) {
      alert("Per procedere manca:\n- " + missing.join("\n- "));
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


/* ==========================================================
   2) RESULTS.HTML → COSTRUZIONE RISULTATI
========================================================== */

const isResultsPage =
  window.location.pathname.endsWith("results.html") ||
  document.getElementById("appliedFilters");

if (isResultsPage) {

  /* ---------------- NETLIFY FETCH WRAPPER ---------------- */
  async function netlifyFetch(functionName, payload) {
    const res = await fetch(`/.netlify/functions/${functionName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return await res.json();
  }

  /* ----------------- FUNZIONI BACKEND -------------------- */

  // 1) Lista prezzi reali (ultime 48h) da Travelpayouts
  async function getRealDestinations(origin) {
    const json = await netlifyFetch("fetchDestinations", { origin });
    // v2/prices/latest → struttura: { success, data: [ { origin, destination, price, ... }, ... ] }
    if (!json || !json.data || !Array.isArray(json.data)) return [];
    return json.data;
  }

  // 2) Info città (nome, paese, coordinate)
  async function getCityInfo(iata) {
    const data = await netlifyFetch("fetchCity", { iata });
    if (!data || !Array.isArray(data) || !data[0]) return null;
    const c = data[0];
    return {
      name: c.name,
      country: c.country_name,
      lat: c.coordinates.lat,
      lon: c.coordinates.lon
    };
  }

  // 3) Meteo reale via Open-Meteo (via Netlify)
  async function getWeatherString(lat, lon) {
    try {
      const data = await netlifyFetch("fetchWeather", { lat, lon });
      if (!data || !data.daily) return "N/D";
      const min = Math.round(data.daily.temperature_2m_min[0]);
      const max = Math.round(data.daily.temperature_2m_max[0]);
      return `${min}°C / ${max}°C`;
    } catch {
      return "N/D";
    }
  }

  /* ----------------- CLASSIFICAZIONE --------------------- */

  function classifyDestination(lat, lon) {
    if (lat > 45) return "mountain";
    if (lat < 40) return "sea";
    return "city";
  }

  function isEuropeCountry(country) {
    const europeCountries = [
      "Italy","France","Spain","Portugal","Greece","Germany","Austria","Switzerland",
      "Malta","Croatia","Slovenia","Hungary","Poland","Czechia","Czech Republic",
      "Belgium","Netherlands","Denmark","Sweden","Norway","Finland",
      "United Kingdom","UK","Ireland","Iceland"
    ];
    return europeCountries.includes(country);
  }

  /* ----------------- TRAVEL SCORE MORBIDO ---------------- */

  function computeScore(dest, filters) {
    let score = 50;

    const { area, budget, duration, type, children } = filters;

    // Prezzo (soft)
    if (budget === "low") {
      if (dest.price <= 150) score += 15;
      else if (dest.price <= 300) score += 8;
      else score -= 5;
    }
    if (budget === "mid") {
      if (dest.price >= 150 && dest.price <= 600) score += 10;
    }
    if (budget === "high") {
      if (dest.price >= 400) score += 8;
    }

    // Area (penalizza ma non elimina)
    if (area === "europe") {
      if (dest.isEurope) score += 10;
      else score -= 10;
    }

    // Tipo (mare/montagna/città)
    if (type !== "all") {
      if (dest.category === type) score += 10;
      else score -= 4;
    }

    // Durata (weekend → penalizza voli lunghi, ma non elimina)
    if (duration === "weekend" && dest.flightHours && dest.flightHours > 4) {
      score -= 8;
    }

    // Bambini → leggero bonus per mare
    if (children > 0 && dest.category === "sea") {
      score += 5;
    }

    return score;
  }

  /* ----------------- HTML DELLE CARD --------------------- */

  function premiumCardHTML(dest, weatherStr, origin) {
    return `
      <article class="card card-premium">
        <div class="card-premium-header">
          <h3 class="card-title">${dest.name}</h3>
          <p class="card-country">${dest.country}</p>
        </div>

        <p class="card-meta">
          🌦 Meteo indicativo: <b>${weatherStr}</b><br>
          💶 Prezzo A/R indicativo: <b>${dest.price} €</b><br>
          🏷 Tipo meta: <b>${dest.category === "sea" ? "Mare" : dest.category === "mountain" ? "Montagna" : "Città"}</b>
        </p>

        <a class="btn-primary"
           target="_blank"
           href="https://www.google.com/travel/flights?q=${origin}%20${dest.iata}">
          Vedi voli su Google Flights →
        </a>
      </article>
    `;
  }

  function gridCardHTML(dest, weatherStr, origin) {
    return `
      <article class="card">
        <h3 class="card-title">${dest.name}</h3>
        <p class="card-country">${dest.country}</p>

        <p class="card-meta">
          🌦 Meteo: <b>${weatherStr}</b><br>
          💶 A/R indicativo: <b>${dest.price} €</b><br>
          🏷 Tipo: <b>${dest.category}</b>
        </p>

        <a class="btn-secondary"
           target="_blank"
           href="https://www.google.com/travel/flights?q=${origin}%20${dest.iata}">
          Vedi i voli →
        </a>
      </article>
    `;
  }

  /* ----------------- RIEPILOGO FILTRI -------------------- */

  function renderFiltersSummary(params) {
    const box = document.getElementById("appliedFilters");
    if (!box) return;

    const airport  = params.get("airport")  || "-";
    const area     = params.get("area")     || "-";
    const budget   = params.get("budget")   || "-";
    const duration = params.get("duration") || "-";
    const start    = params.get("start")    || "-";
    const end      = params.get("end")      || "-";
    const type     = params.get("type")     || "all";
    const vibe     = params.get("vibe")     || "all";
    const children = params.get("children") || "0";

    box.innerHTML = `
      <div class="filters-summary-inner">
        <h3>Filtri applicati</h3>
        <p>
          ✈ <b>Aeroporto:</b> ${airport}<br>
          🌍 <b>Area:</b> ${area}<br>
          💶 <b>Budget:</b> ${budget}<br>
          📆 <b>Date:</b> ${start} → ${end}<br>
          ⏱ <b>Durata:</b> ${duration}<br>
          🏷 <b>Tipo meta:</b> ${type}<br>
          🎭 <b>Stile viaggio:</b> ${vibe}<br>
          👶 <b>Bambini:</b> ${children}
        </p>
      </div>
    `;
  }

  /* ----------------- FUNZIONE PRINCIPALE ----------------- */

  async function initResults() {
    const params = getQueryParams();

    let airport  = params.get("airport");
    const area     = params.get("area")     || "world";
    const budget   = params.get("budget")   || "mid";
    const duration = params.get("duration") || "weekend";
    const start    = params.get("start");
    const end      = params.get("end");

    const type     = params.get("type")     || "all";
    const vibe     = params.get("vibe")     || "all";
    const children = parseInt(params.get("children") || "0", 10);
    const period   = params.get("period")   || "";

    if (!airport || !start || !end) {
      alert("I parametri di ricerca non sono completi. Torna alla pagina iniziale e riprova.");
      window.location.href = "index.html";
      return;
    }

    if (airport === "donotknow") {
      airport = "MIL"; // fallback neutro
    }

    renderFiltersSummary(params);

    const topContainer  = document.getElementById("topCards");
    const gridContainer = document.getElementById("gridResults");

    if (topContainer) {
      topContainer.innerHTML = `<p class="loader-text">Sto analizzando i dati reali delle ultime ricerche voli…</p>`;
    }
    if (gridContainer) {
      gridContainer.innerHTML = "";
    }

    // 1) Chiamata API via Netlify: v2/prices/latest
    let tickets;
    try {
      tickets = await getRealDestinations(airport);
    } catch (e) {
      console.error("Errore nel recupero destinazioni:", e);
      topContainer.innerHTML = "<p>Non riesco a recuperare le destinazioni in questo momento. Riprova più tardi.</p>";
      return;
    }

    if (!tickets || tickets.length === 0) {
      topContainer.innerHTML = "<p>Al momento non ho abbastanza dati reali per suggerire mete da questo aeroporto. Riprova più tardi.</p>";
      return;
    }

    // 2) Raggruppo per destinazione (scelgo il prezzo più basso per ciascuna)
    const bestByDest = new Map();
    for (const t of tickets) {
      const destCode = t.destination;
      if (!destCode || !t.price) continue;
      if (!bestByDest.has(destCode) || t.price < bestByDest.get(destCode).price) {
        bestByDest.set(destCode, t);
      }
    }

    const enriched = [];
    for (const [iata, t] of bestByDest.entries()) {
      const info = await getCityInfo(iata);
      if (!info) continue;

      const category = classifyDestination(info.lat, info.lon);

      enriched.push({
        iata,
        price: Math.round(t.price),
        name: info.name,
        country: info.country,
        lat: info.lat,
        lon: info.lon,
        isEurope: isEuropeCountry(info.country),
        category
      });
    }

    if (!enriched.length) {
      topContainer.innerHTML = "<p>Ho recuperato i voli ma non sono riuscita a collegarli a mete leggibili. Riprova più tardi.</p>";
      return;
    }

    // 3) TravelScore morbido (guidato dai filtri, ma senza eliminare)
    const filters = { area, budget, duration, type, children, period, vibe };

    const scored = enriched
      .map(d => ({
        ...d,
        travelScore: computeScore(d, filters)
      }))
      .sort((a, b) => b.travelScore - a.travelScore);

    // 4) Selezione: TOP 5 + altre 10
    const topN  = scored.slice(0, 5);
    const restN = scored.slice(5, 15);

    // 5) Render TOP 5
    let topHTML = "";
    for (const d of topN) {
      const weatherStr = await getWeatherString(d.lat, d.lon);
      topHTML += premiumCardHTML(d, weatherStr, airport);
    }
    topContainer.innerHTML = topHTML || "<p>Al momento non ho mete perfette, riprova più tardi.</p>";

    // 6) Render griglia altre 10
    let gridHTML = "";
    for (const d of restN) {
      const weatherStr = await getWeatherString(d.lat, d.lon);
      gridHTML += gridCardHTML(d, weatherStr, airport);
    }
    gridContainer.innerHTML = gridHTML || "<p>Per ora ho trovato solo alcune destinazioni principali. Presto aggiungerò altre idee!</p>";
  }

  // Avvio logica risultati
  initResults();
}
