/* ===============================
   SAFE TRAVELING – SCRIPT FINALE
   =============================== */

// FORM (INDEX.HTML)
const form = document.getElementById("tripForm");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const airport = document.getElementById("airport").value;
    const area = document.getElementById("area").value;
    const budget = document.getElementById("budget").value;
    const duration = document.getElementById("duration").value;
    const children = document.getElementById("children").value || 0;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    // VALIDAZIONE
    if (!airport || !area || !budget || !duration || !startDate || !endDate) {
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

    window.location.href = `results.html?${params.toString()}`;
  });
}

// FUNZIONE RISULTATI
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

async function generateResults() {
  if (!document.getElementById("gridResults")) return;

  const filters = getQueryParams();

  const fakeDestinations = [
    { name: "Valencia", country: "Spagna", price: 89, score: 92, type: "city" },
    { name: "Porto", country: "Portogallo", price: 120, score: 88, type: "city" },
    { name: "Faro", country: "Portogallo", price: 150, score: 85, type: "sea" },
    { name: "Atene", country: "Grecia", price: 110, score: 90, type: "city" },
    { name: "Malta", country: "Malta", price: 95, score: 86, type: "sea" }
  ];

  let filtered = fakeDestinations;

  if (filters.area === "sea")
    filtered = filtered.filter((d) => d.type === "sea");

  if (filters.area === "city")
    filtered = filtered.filter((d) => d.type === "city");

  filtered = filtered.filter((d) => {
    if (filters.budget === "low") return d.price < 120;
    if (filters.budget === "mid") return d.price >= 120 && d.price <= 300;
    if (filters.budget === "high") return d.price > 300;
    return true;
  });

  const top = [...filtered].sort((a, b) => b.score - a.score).slice(0, 2);

  document.getElementById("topCards").innerHTML = top
    .map(
      (d) => `
      <div class="card">
        <h3 class="card-title">${d.name}, ${d.country}</h3>
        <span class="card-score">⭐ ${d.score}/100</span>
        <p class="card-meta">Da €${d.price}</p>
      </div>`
    )
    .join("");

  document.getElementById("gridResults").innerHTML = filtered
    .map(
      (d) => `
      <div class="card">
        <h3 class="card-title">${d.name}, ${d.country}</h3>
        <span class="card-score">⭐ ${d.score}/100</span>
        <p class="card-meta">Da €${d.price}</p>
      </div>`
    )
    .join("");
}

generateResults();
