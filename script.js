/* ===============================
   SAFE TRAVEL – SCRIPT FINALE
   =============================== */

// --- Lettura parametri URL ---
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

// --- Database interno ---
const DESTINATIONS = [
  { name: "Valencia", country: "Spagna", area: "europe", tags: ["sea","city"], priceFrom: 180, scoreBase: 88 },
  { name: "Porto", country: "Portogallo", area: "europe", tags: ["city"], priceFrom: 170, scoreBase: 86 },
  { name: "Faro", country: "Portogallo", area: "europe", tags: ["sea"], priceFrom: 220, scoreBase: 87 },
  { name: "Atene", country: "Grecia", area: "europe", tags: ["city","culture"], priceFrom: 200, scoreBase: 90 }
];

// --- Calcolo punteggio ---
function computeScore(dest) {
  return Math.min(100, dest.scoreBase + Math.floor(Math.random() * 10));
}

// --- Gestione FORM in index.html ---
const form = document.getElementById("tripForm");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const airport   = document.getElementById("airport").value;
    const startDate = document.getElementById("startDate").value;
    const endDate   = document.getElementById("endDate").value;

    if (!airport || !startDate || !endDate) {
      alert("Seleziona almeno aeroporto, data di partenza e ritorno.");
      return;
    }

    const area     = document.getElementById("area").value;
    const budget   = document.getElementById("budget").value;
    const duration = document.getElementById("duration").value;
    const children = document.getElementById("children").value || "0";

    const params = new URLSearchParams({
      airport,
      startDate,
      endDate,
      area,
      budget,
      duration,
      children
    });

    // 🚀 REDIRECT CORRETTO
    window.location.href = results.html?${params.toString()};
  });
}

// --- Generazione risultati in results.html ---
function generateResults() {
  const grid = document.getElementById("gridResults");
  const top = document.getElementById("topCards");
  const status = document.getElementById("statusMessage");

  if (!grid || !top) return;

  const results = DESTINATIONS.map(d => ({
    ...d,
    score: computeScore(d)
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
