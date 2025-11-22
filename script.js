/* ==========================================================
   SAFE TRAVEL – SCRIPT JS (VERCEL — VERSIONE DEFINITIVA)
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
   1) INDEX → REDIRECT VERSO RESULTS.HTML
========================================================== */

const tripForm = document.getElementById("tripForm");

if (tripForm) {
  tripForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const airport  = document.getElementById("airport")?.value;
    const area     = document.getElementById("area")?.value;
    const budget   = document.getElementById("budget")?.value;
    const duration = document.getElementById("duration")?.value;
    const start    = document.getElementById("startDate")?.value;
    const end      = document.getElementById("endDate")?.value;

    const type     = document.getElementById("type")?.value || "all";
    const vibe     = document.getElementById("vibe")?.value || "all";
    const children = document.getElementById("children")?.value || "0";
    const period   = document.getElementById("period")?.value || "";

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
   2) VERCEL API CALLER
========================================================== */

async function callAPI(endpoint, payload) {
  const res = await fetch(`/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });
  return res.json();
}


/* ==========================================================
   API WRAPPERS
========================================================== */

async function getRealDestinations(origin) {
  const data = await callAPI("fetchDestinations", { origin });
  return data?.data || [];
}

async function getCityData(iata) {
  return await callAPI("fetchCity", { iata });
}

async function getWeather(lat, lon) {
  return await callAPI("fetchWeather", { lat, lon });
}


/* ==========================================================
   UTILITY FUNZIONI
========================================================== */

function classifyDestination(lat, lon) {
  if (lat > 45) return "mountain";
  if (lat < 40) return "sea";
  return "city";
}

function isEurope(country) {
  const EU = [
    "Italy","France","Spain","Portugal","Greece","Germany","Austria","Switzerland",
    "Malta","Croatia","Slovenia","Hungary","Poland","Czechia","Czech Republic",
    "Belgium","Netherlands","Denmark","Sweden","Norway","Finland",
    "United Kingdom","UK","Ireland","Iceland"
  ];
  return EU.includes(country);
}

function computeScore(dest, filters) {
  let score = 50;

  // Prezzo
  if (filters.budget === "low") {
    if (dest.price < 150) score += 14;
    else if (dest.price < 300) score += 8;
    else score -= 5;
  }
  if (filters.budget === "mid") {
    if (dest.price >= 150 && dest.price <= 600) score += 8;
  }
  if (filters.budget === "high") {
    if (dest.price > 500) score += 6;
  }

  // Area
  if (filters.area === "europe" && !dest.isEurope)
    score -= 10;

  // Categoria
  if (filters.type !== "all" && dest.category !== filters.type)
    score -= 5;
  else if (filters.type !== "all")
    score += 8;

  // Bambini → preferenza mare
  if (filters.children > 0 && dest.category === "sea")
    score += 5;

  return score;
}


/* ==========================================================
   CARD HTML
========================================================== */

function premiumCardHTML(dest, weather, origin) {
  return `
  <article class="card card-premium">
    <h3 class="card-title">${dest.name}</h3>
    <p class="card-country">${dest.country}</p>

    <p class="card-meta">
      🌦 Meteo: <b>${weather}</b><br>
      💶 Prezzo stimato: <b>${dest.price} €</b><br>
      🏷 Tipo meta: <b>${dest.category}</b>
    </p>

    <a class="btn-primary"
       target="_blank"
       href="https://www.google.com/travel/flights?q=${origin}%20${dest.iata}">
       Vedi voli →
    </a>
  </article>`;
}

function gridCardHTML(dest, weather, origin) {
  return `
  <article class="card">
    <h3>${dest.name}</h3>
    <p class="card-country">${dest.country}</p>

    <p class="card-meta">
      🌦 ${weather}<br>
      💶 ${dest.price} €<br>
      🏷 ${dest.category}
    </p>

    <a class="btn-secondary"
       target="_blank"
       href="https://www.google.com/travel/flights?q=${origin}%20${dest.iata}">
       Dettagli →
    </a>
  </article>`;
}


/* ==========================================================
   MAIN — RESULTS
========================================================== */

async function initResults() {

  const params = getQueryParams();

  let airport = params.get("airport");

  // ⭐ CORREZIONE AUTOMATICA AEROPORTI
  if (airport === "MIL") airport = "MXP";
  if (airport === "ROM") airport = "FCO";

  if (airport === "donotknow") airport = "MXP";

  const filters = {
    area: params.get("area"),
    budget: params.get("budget"),
    duration: params.get("duration"),
    type: params.get("type") || "all",
    vibe: params.get("vibe") || "all",
    children: parseInt(params.get("children") || "0")
  };

  const topContainer = document.getElementById("topCards");
  const gridContainer = document.getElementById("gridResults");

  topContainer.innerHTML = `<p>Sto analizzando mete reali…</p>`;

  // 1) Recupero voli reali
  const tickets = await getRealDestinations(airport);
  if (!tickets.length) {
    topContainer.innerHTML = `<p>Non ho trovato voli dal tuo aeroporto. Riprova più tardi.</p>`;
    return;
  }

  // 2) Prezzo minimo per IATA
  const unique = new Map();
  for (const t of tickets) {
    if (!unique.has(t.destination) || t.price < unique.get(t.destination).price)
      unique.set(t.destination, t);
  }

  // 3) Arricchimento con città
  const enriched = [];
  for (const [iata, t] of unique.entries()) {
    const info = await getCityData(iata);
    if (!info || !info.name) continue;

    const category = classifyDestination(info.lat, info.lon);

    enriched.push({
      iata,
      price: Math.round(t.price),
      name: info.name,
      country: info.country,
      lat: info.lat,
      lon: info.lon,
      isEurope: isEurope(info.country),
      category
    });
  }

  if (!enriched.length) {
    topContainer.innerHTML = `<p>Ho trovato voli, ma non sono riuscita a collegarli a mete leggibili.</p>`;
    return;
  }

  // 4) TravelScore
  const ranked = enriched
    .map(d => ({ ...d, travelScore: computeScore(d, filters) }))
    .sort((a, b) => b.travelScore - a.travelScore);

  const top5  = ranked.slice(0, 5);
  const next10 = ranked.slice(5, 15);

  // 5) Rendering
  let topHTML = "";
  for (const d of top5) {
    const w = await getWeather(d.lat, d.lon);
    const weather = w?.daily
      ? `${Math.round(w.daily.temperature_2m_min[0])}° / ${Math.round(w.daily.temperature_2m_max[0])}°`
      : "N/D";
    topHTML += premiumCardHTML(d, weather, airport);
  }
  topContainer.innerHTML = topHTML;

  let gridHTML = "";
  for (const d of next10) {
    const w = await getWeather(d.lat, d.lon);
    const weather = w?.daily
      ? `${Math.round(w.daily.temperature_2m_min[0])}° / ${Math.round(w.daily.temperature_2m_max[0])}°`
      : "N/D";
    gridHTML += gridCardHTML(d, weather, airport);
  }
  gridContainer.innerHTML = gridHTML;
}


/* ==========================================================
   START
========================================================== */

if (window.location.pathname.includes("results.html")) {
  initResults();
}

