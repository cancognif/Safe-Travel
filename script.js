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


// -----------------------------
// LOGICA DI SUGGERIMENTO
// -----------------------------
function getSuggestions(area, budget, vibe, period) {
  
  const suggestions = [];

  // EUROPA LOW BUDGET
  if (area === "europe" && budget === "low") {
    suggestions.push({
      title: "Porto",
      score: 85,
      meta: "Europa • Economica • Clima mite",
      tagline: `Perfetta per un viaggio semplice e low cost. ${period ? "Periodo consigliato: " + period : ""}`
    });
    suggestions.push({
      title: "Budapest",
      score: 82,
      meta: "Europa • Cultura • Città",
      tagline: "Ottima per iniziare a viaggiare: sicura, bella e accessibile."
    });
  }

  // MARE
  if (area === "sea") {
    suggestions.push({
      title: "Creta",
      score: 88,
      meta: "Grecia • Mare • Estate",
      tagline: "Mare lungo, costi accessibili e ambiente semplice per chi viaggia poco."
    });
    suggestions.push({
      title: "Algarve",
      score: 84,
      meta: "Portogallo • Mare",
      tagline: "Scogliere, spiagge lunghe e clima stabile."
    });
  }

  // MONTAGNA
  if (area === "mountain") {
    suggestions.push({
      title: "Dolomiti",
      score: 91,
      meta: "Italia • Montagna",
      tagline: "Perfetta per relax, natura e paesaggi incredibili."
    });
  }

  // FALLBACK (quando area = mondo)
  if (area === "world") {
    suggestions.push({
      title: "Lisbona",
      score: 87,
      meta: "Europa • Clima mite",
      tagline: "Ideale per un viaggio leggero, sicuro, senza stress."
    });
    suggestions.push({
      title: "Dublino",
      score: 81,
      meta: "City Break • Nord Europa",
      tagline: "Perfetta per un weekend: tranquilla, semplice e accogliente."
    });
  }

  return suggestions;
}


// -----------------------------
// RENDER SUGGESTIONS
// -----------------------------
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

  document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" });
}

