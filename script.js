const form = document.getElementById("tripForm");
const container = document.getElementById("cardsContainer");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const area = document.getElementById("area").value;
  const budget = document.getElementById("budget").value;
  const vibe = document.getElementById("vibe").value;
  const period = document.getElementById("period").value.trim();

  const results = getSuggestions(area, budget, vibe, period);
  displayResults(results);
});

function getSuggestions(area, budget, vibe, period) {
  // MOCK DATI — sostituibili con API reali
  const db = [
    {
      title: "Lisbona",
      score: 85,
      meta: "Europa • Clima mite",
      tagline: "Ottima per chi vuole un viaggio semplice e sicuro."
    },
    {
      title: "Creta",
      score: 88,
      meta: "Mare • Grecia",
      tagline: "Perfetta se cerchi mare lungo e ottimo rapporto qualità/prezzo."
    },
    {
      title: "Dublino",
      score: 81,
      meta: "City Break • Nord Europa",
      tagline: "Benessere, sicurezza, ideale per chi viaggia poco."
    }
  ];

  return db;
}

function displayResults(list) {
  container.innerHTML = "";

  list.forEach(item => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="card-title">${item.title}</div>
      <div class="card-score">SAFE Score ${item.score}</div>
      <div class="card-meta">${item.meta}</div>
      <div class="card-tagline">${item.tagline}</div>
    `;

    container.appendChild(card);
  });

  document.getElementById("resultsSection")
    .scrollIntoView({ behavior: "smooth" });
}
