/* ===============================
   SAFE TRAVEL – SCRIPT FINALE
   =============================== */

// Gestione form in index.html
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


// Lettura parametri URL (results.html)
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


// Motore semplice di destinazioni interne
async function generateResults() {
  const grid = document.getElementById("gridResults");
  const top = document.getElementById("topCards");
  const statusEl = document.getElementById("statusMessage");

  if (!grid || !top) return;

  const filters = getQueryParams();

  if (statusEl) {
    statusEl.textContent = "Sto analizzando mete reali…";
  }

  const destinations = [
    { name: "Valencia", country: "Spagna", area: "sea", type: "city-sea", price: 120, score: 92 },
    { name: "Porto", country: "Portogallo", area: "sea", type: "city-sea", price: 110, score: 90 },
    { name: "Faro", country: "Portogallo", area: "sea", type: "sea", price: 150, score: 88 },
    { name: "Atene", country: "Grecia", area: "city", type: "city", price: 130, score: 91 },
    { name: "Lisbona", country: "Portogallo", area: "city", type: "city", price: 160, score: 89 },
    { name: "Budapest", country: "Ungheria", area: "city", type: "city", price: 140, score: 87 },
    { name: "Creta", country: "Grecia", area: "sea", type: "sea", price: 220, score: 86 },
    { name: "Canarie", country: "Spagna", area: "world", type: "sea", price: 250, score: 90 },
    { name: "Edimburgo", country: "Regno Unito", area: "europe", type: "city", price: 210, score: 84 },
    { name: "Dublino", country: "Irlanda", area: "europe", type: "city", price: 230, score: 83 }
  ];

  let filtered = [...destinations];

  // Filtri area
  if (filters.area === "sea") {
    filtered = filtered.filter(d => d.type.includes("sea"));
  } else if (filters.area === "city") {
    filtered = filtered.filter(d => d.type.includes("city"));
  } else if (filters.area === "europe") {
    filtered = filtered.filter(d => d.country !== "Spagna" || d.name !== "Canarie");
  }

  // Filtri budget
  filtered = filtered.filter(d => {
    if (filters.budget === "low") return d.price < 130;
    if (filters.budget === "mid") return d.price >= 130 && d.price <= 220;
    if (filters.budget === "high") return d.price > 220;
    return true;
  });

  if (!filtered.length) {
    statusEl.textContent = "Con questi filtri non trovo mete. Prova ad ampliare la ricerca.";
    top.innerHTML = "";
    grid.innerHTML = "";
    return;
  }

  filtered.sort((a, b) => b.score - a.score);
  const top2 = filtered.slice(0, 2);

  top.innerHTML = top2
    .map(d => `
      <div class="card">
        <h3 class="card-title">${d.name}, ${d.country}</h3>
        <span class="card-score">⭐ TravelScore ${d.score}/100</span>
        <p class="card-meta">Indicativamente da €${d.price} a persona.</p>
      </div>
    `)
    .join("");

  grid.innerHTML = filtered
    .map(d => `
      <div class="card">
        <h3 class="card-title">${d.name}, ${d.country}</h3>
        <span class="card-score">⭐ ${d.score}/100</span>
        <p class="card-meta">Indicativamente da €${d.price} a persona.</p>
      </div>
    `)
    .join("");

  statusEl.textContent = "Ecco le mete più adatte ai tuoi filtri.";
}

generateResults();
