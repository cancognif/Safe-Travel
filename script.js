/* ==========================================================
   SAFE TRAVEL – SCRIPT JS (VERSIONE NETLIFY BACKEND READY)
   - index.html → invia filtri
   - results.html → riceve parametri, chiama Netlify Functions
========================================================== */


/* -------------------- MOBILE NAV ------------------------ */
const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });
}


/* -------------------- URL UTILITY ------------------------ */
function getQueryParams() {
  return new URLSearchParams(window.location.search);
}


/* ==========================================================
   1) INDEX.HTML → REDIRECT AI RISULTATI
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
    const children = document.getElementById("children").value;
    const period   = document.getElementById("period").value;

    // Validazione campi obbligatori
    const missing = [];
    if (!airport)  missing.push("l’aeroporto");
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
   2) RISULTATI (SE SIAMO IN results.html)
========================================================== */

const isResultsPage =
  window.location.pathname.endsWith("results.html") ||
  document.getElementById("appliedFilters");

if (isResultsPage) {


/* ----------------------------------------------------------
   FUNZIONI BACKEND (CHIAMANO NETLIFY FUNCTIONS)
---------------------------------------------------------- */

async function netlifyFetch(functionName, payload) {
  const res = await fetch(`/.netlify/functions/${functionName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

async function getRealDestinations(origin) {
  return await netlifyFetch("fetchDestinations", { origin });
}

async function getCityInfo(iata) {
  return await netlifyFetch("fetchCity", { iata });
}

async function getWeather(lat, lon) {
  return await netlifyFetch("fetchWeather", { lat, lon });
}


/* ----------------------------------------------------------
   CLASSIFICAZIONE
---------------------------------------------------------- */
function classifyDestination(lat, lon) {
  if (lat > 44) return "mountain";
  if (lat < 40) return "sea";
  return "city";
}


/* ----------------------------------------------------------
   TRAVEL SCORE
---------------------------------------------------------- */
function computeScore(dest, filters) {
  let score = 50;

  const { area, budget, duration, type, children } = filters;

  if (budget === "low" && dest.price <= 200) score += 12;
  if (budget === "mid" && dest.price <= 600) score += 8;
  if (budget === "high") score += 6;

  if (area === "europe" && dest.isEurope) score += 10;
  if (area === "europe" && !dest.isEurope) score -= 15;

  if (type !== "all" && dest.category === type) score += 10;

  if (duration === "weekend" && dest.flightHours > 3) score -= 8;

  if (children > 0 && dest.category === "sea") score += 5;

  return score;
}


/* ----------------------------------------------------------
   COSTRUZIONE CARD
---------------------------------------------------------- */

function premiumCardHTML(dest, weather, price, origin) {
  return `
  <article class="card card-premium">
    <h3 class="card-title">${dest.name}</h3>
    <p class="card-country">${dest.country}</p>

    <p class="card-meta">
      🌦 Meteo: ${weather}<br>
      💶 Prezzo A/R stimato: ${price}<br>
      🏷 Categoria: ${dest.category}
    </p>

    <a class="btn-primary"
       target="_blank"
       href="https://www.google.com/travel/flights?q=${origin}%20${dest.iata}">
       Vedi i voli →
    </a>
  </article>`;
}

function gridCardHTML(dest, weather, price, origin) {
  return `
  <article class="card">
    <h3 class="card-title">${dest.name}</h3>
    <p class="card-country">${dest.country}</p>

    <p class="card-meta">
      🌦 Meteo: ${weather}<br>
      💶 Prezzo A/R stimato: ${price}<br>
      🏷 Categoria: ${dest.category}
    </p>

    <a class="btn-secondary"
       target="_blank"
       href="https://www.google.com/travel/flights?q=${origin}%20${dest.iata}">
       Vedi dettagli →
    </a>
  </article>`;
}


/* ----------------------------------------------------------
   RIEPILOGO FILTRI
---------------------------------------------------------- */
function renderFiltersSummary(params) {
  const box = document.getElementById("appliedFilters");
  if (!box) return;

  box.innerHTML = `
    <div class="filters-summary-inner">
      <h3>Filtri applicati</h3>
      <p>
        ✈ Aeroporto: <b>${params.get("airport")}</b><br>
        🌍 Area: <b>${params.get("area")}</b><br>
        💶 Budget: <b>${params.get("budget")}</b><br>
        📆 Date: <b>${params.get("start")} → ${params.get("end")}</b><br>
        ⏱ Durata: <b>${params.get("duration")}</b><br>
        👶 Bambini: <b>${params.get("children")}</b><br>
      </p>
    </div>`;
}


/* ----------------------------------------------------------
   FUNZIONE PRINCIPALE RISULTATI
---------------------------------------------------------- */
async function initResults() {

  const params = getQueryParams();

  const airport  = params.get("airport");
  const area     = params.get("area");
  const budget   = params.get("budget");
  const duration = params.get("duration");
  const start    = params.get("start");
  const end      = params.get("end");
  const type     = params.get("type");
  const vibe     = params.get("vibe");
  const children = parseInt(params.get("children"));
  const period   = params.get("period");

  renderFiltersSummary(params);

  const topContainer  = document.getElementById("topCards");
  const gridContainer = document.getElementById("gridResults");

  topContainer.innerHTML =
    "<p class='loader-text'>Sto analizzando i dati reali…</p>";

  // fallback aeroporto
  const origin = (airport === "donotknow" ? "MIL" : airport);

  // 1️⃣ Recupero destinazioni reali
  const raw = await getRealDestinations(origin);
  if (!raw || !raw.data) {
    topContainer.innerHTML =
      "<p>Non riesco a recuperare le destinazioni. Riprova più tardi.</p>";
    return;
  }

  // 2️⃣ Estraggo oggetti destinazione
  const entries = Object.entries(raw.data).slice(0, 60);

  const enriched = [];
  for (const [iata, info] of entries) {
    const city = await getCityInfo(iata);
    if (!city || !city[0]) continue;

    const c = city[0];

    const category = classifyDestination(c.coordinates.lat, c.coordinates.lon);

    enriched.push({
      iata,
      price: info.price,
      name: c.name,
      country: c.country_name,
      lat: c.coordinates.lat,
      lon: c.coordinates.lon,
      isEurope:
        ["Italy","France","Spain","Germany","Portugal","Greece","Austria","Switzerland",
         "Belgium","Netherlands","Denmark","Sweden","Norway","Finland","UK","Ireland",
         "Croatia","Slovenia","Poland","Hungary","Iceland","Czech Republic"]
         .includes(c.country_name),
      category
    });
  }

  // 3️⃣ Filtri
  const filtered = enriched.filter(d => {
    if (area === "europe" && !d.isEurope) return false;
    if (type !== "all" && d.category !== type) return false;
    return true;
  });

  if (!filtered.length) {
    topContainer.innerHTML =
      "<p>Nessuna destinazione trovata con questi filtri.</p>";
    return;
  }

  // 4️⃣ TravelScore
  const scoreFilters = { area, budget, duration, type, children, period };

  const scored = filtered
    .map(d => ({
      ...d,
      travelScore: computeScore(d, scoreFilters)
    }))
    .sort((a, b) => b.travelScore - a.travelScore);

  const top2  = scored.slice(0, 2);
  const rest  = scored.slice(2, 12);


  /* 5️⃣ Render TOP 2 */

  let topHTML = "";
  for (const dest of top2) {
    const weather = await getWeather(dest.lat, dest.lon);
    const price = dest.price + " €";

    topHTML += premiumCardHTML(dest, weather, price, origin);
  }
  topContainer.innerHTML = topHTML;


  /* 6️⃣ Render griglia */

  let gridHTML = "";
  for (const dest of rest) {
    const weather = await getWeather(dest.lat, dest.lon);
    const price = dest.price + " €";

    gridHTML += gridCardHTML(dest, weather, price, origin);
  }
  gridContainer.innerHTML = gridHTML;
}


// Avvia la generazione se siamo in results.html
initResults();

} // fine if isResultsPage
