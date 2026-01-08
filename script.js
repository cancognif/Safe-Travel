// === DATASET METE (mock) ===
const destinations = [
  {
    name: "Lisbona 🇵🇹",
    budget: 450,
    flightScore: 8,
    seasonScore: 9,
    climateScore: 8,
    crowdScore: 7,
    familyScore: 7,
    valueScore: 9
  },
  {
    name: "Valencia 🇪🇸",
    budget: 400,
    flightScore: 7,
    seasonScore: 8,
    climateScore: 8,
    crowdScore: 8,
    familyScore: 8,
    valueScore: 8
  },
  {
    name: "Atene 🇬🇷",
    budget: 520,
    flightScore: 7,
    seasonScore: 7,
    climateScore: 7,
    crowdScore: 6,
    familyScore: 6,
    valueScore: 7
  }
];

// === PESI ===
const WEIGHTS = {
  budget: 0.25,
  flight: 0.15,
  season: 0.15,
  value: 0.15,
  climate: 0.10,
  crowd: 0.10,
  family: 0.10
};

// === CALCOLO RATING ===
function calculateRating(dest, userBudget, children) {

  let budgetScore = dest.budget <= userBudget ? 9 : 5;
  let familyScore = children > 0 ? dest.familyScore : 10 - dest.familyScore;

  const rating =
    budgetScore * WEIGHTS.budget +
    dest.flightScore * WEIGHTS.flight +
    dest.seasonScore * WEIGHTS.season +
    dest.valueScore * WEIGHTS.value +
    dest.climateScore * WEIGHTS.climate +
    dest.crowdScore * WEIGHTS.crowd +
    familyScore * WEIGHTS.family;

  return Math.round(rating * 10) / 10;
}

// === STELLE ===
function getStars(rating) {
  return "★".repeat(Math.floor(rating)) + "☆".repeat(10 - Math.floor(rating));
}

// === FORM SUBMIT ===
const form = document.getElementById("tripForm");

if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const budgetValue = document.getElementById("budget").value;
    const children = parseInt(document.getElementById("children").value, 10);

    let userBudget = budgetValue === "low" ? 300 :
                     budgetValue === "mid" ? 600 : 1000;

    const ranked = destinations
      .map(d => ({
        ...d,
        rating: calculateRating(d, userBudget, children)
      }))
      .sort((a, b) => b.rating - a.rating);

    localStorage.setItem("bestDestination", JSON.stringify(ranked[0]));
    window.location.href = "results.html";
  });
}

// === RISULTATI ===
const result = localStorage.getItem("bestDestination");

if (result) {
  const dest = JSON.parse(result);
  document.querySelector(".destination-name").innerText = dest.name;
  document.querySelector(".score-number").innerText = dest.rating;
  document.querySelector(".rating-stars").innerText = getStars(dest.rating);
}
