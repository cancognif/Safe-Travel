/* ===============================
   SAFE TRAVEL – SCRIPT FINALE CORRETTO
   =============================== */

/**
 * DATABASE INTERNO DI DESTINAZIONI
 */
const DESTINATIONS = [
  {
    id: "valencia",
    name: "Valencia",
    country: "Spagna",
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
    areaGroup: "europe",
    tags: ["city", "weekend"],
    priceFrom: 170,
    bestMonths: [3,4,5,9,10],
    scoreBase: 86
  },
  {
    id: "faro",
    name: "Faro",
    country: "Portogallo",
    areaGroup: "europe",
    tags: ["sea", "family"],
    priceFrom: 220,
    bestMonths: [5,6,9,10],
    scoreBase: 87
  },
  {
    id: "atene",
    name: "Atene",
    country: "Grecia",
    areaGroup: "europe",
    tags: ["city", "culture"],
    priceFrom: 200,
    bestMonths: [4,5,9,10],
    scoreBase: 90
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
function computeScore(dest, filters) {
  let score = dest.scoreBase;

  const month = new Date(filters.startDate).getMonth() + 1;

  if (dest.bestMonths.includes(month)) score += 8;

  if (filters.area === "sea" && dest.tags.includes("sea")) score += 8;
  if (filters.area === "city" && dest.tags.includes("city")) score += 8;

  if (filters.budget === "low" && dest.priceFrom <= 200) score += 5;
  if (filters.budget === "high" && dest.priceFrom > 250) score += 5;

  return Math.min(100, score);
}

/* -------------------------------
   FORM SUBMIT
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
      alert("Compila tutti i campi obbligatori.");
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

    // CORRETTA 🔥
    window.location.href = results.html?${params.toString()};
  });
}

/* -------------------------------
   GENERAZIONE RISULTATI
-------------------------------- */
function generateResults() {
  const top = document.getElementById("topCards");
  const grid = document.getElementById("gridResults");
  const status = document.getElementById("statusMessage");

  if (!top || !grid) return;

  const filters = getQueryParams();
  const month = new Date(filters.startDate).getMonth() + 1;

  let results = DESTINATIONS.map(d => ({
    ...d,
    score: computeScore(d, { ...filters, month })
  }));

  results.sort((a, b) => b.score - a.score);

  const top3 = results.slice(0, 3);
  const others = results.slice(3);

  top.innerHTML = top3.map(d => `
    <div class="card">
      <h3 class="card-title">${d.name}, ${d.country}</h3>
      <span class="card-score">⭐ ${d.score}/100</span>
      <p class="card-meta">Da €${d.priceFrom}</p>
    </div>
  `).join("");

  grid.innerHTML = others.map(d => `
    <div class="card">
      <h3 class="card-title">${d.name}, ${d.country}</h3>
      <span class="card-score">⭐ ${d.score}/100</span>
      <p class="card-meta">Da €${d.priceFrom}</p>
    </div>
  `).join("");

  status.textContent = "Ecco le mete perfette per i tuoi filtri!";
}

generateResults();
