const state = {
  objects: [],
  favorites: [],
  progress: null,
  userId: "explorer-1",
  quizzes: []
};

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!payload.success) throw new Error(payload.error || "Request failed");
  return payload.data;
}

function switchTab(name) {
  document.querySelectorAll(".tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === name);
  });
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === "tab-" + name);
  });
  if (name === "favorites") renderFavorites();
}

async function loadCatalog() {
  const type = document.getElementById("typeFilter").value;
  const search = document.getElementById("searchInput").value;
  const params = new URLSearchParams({ type, search });
  state.objects = await fetchJson("/api/objects?" + params.toString());
  renderCatalog();
  fillCompareSelects();
}

function isFavorite(id) {
  return state.favorites.includes(id);
}

function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  grid.innerHTML = "";
  state.objects.forEach((item) => {
    const card = document.createElement("div");
    card.className = "object";
    card.innerHTML = "<div class=\"emoji\">" + item.imageEmoji + "</div><h3>" + item.name + "</h3><div class=\"meta\"><span>" + item.type + "</span>" + (item.habitable ? "<span>Habitable</span>" : "") + "<span>" + item.gravityMs2 + " m/s2</span></div><p>" + item.description + "</p>";
    const button = document.createElement("button");
    button.className = "fav" + (isFavorite(item.id) ? " on" : "");
    button.textContent = isFavorite(item.id) ? "★ Favorite" : "☆ Save";
    button.onclick = async () => {
      await toggleFavorite(item.id);
    };
    card.appendChild(button);
    grid.appendChild(card);
  });
}

function fillCompareSelects() {
  const planets = state.objects.filter((item) => item.type === "PLANET");
  const source = planets.length > 0 ? planets : state.objects;
  const first = document.getElementById("firstSelect");
  const second = document.getElementById("secondSelect");
  first.innerHTML = "";
  second.innerHTML = "";
  source.forEach((item) => {
    first.add(new Option(item.name, item.id));
    second.add(new Option(item.name, item.id));
  });
  if (source.length > 1) second.selectedIndex = 1;
}

async function comparePlanets() {
  const firstId = document.getElementById("firstSelect").value;
  const secondId = document.getElementById("secondSelect").value;
  const result = await fetchJson("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstId, secondId })
  });
  const box = document.getElementById("compareResult");
  box.innerHTML = "<div class=\"grid\">" +
    "<div class=\"object\"><div class=\"emoji\">" + result.first.imageEmoji + "</div><h3>" + result.first.name + "</h3><p>Diameter: " + result.first.diameterKm + " km</p><p>Gravity: " + result.first.gravityMs2 + " m/s2</p><p>Temp: " + result.first.meanTempC + " C</p></div>" +
    "<div class=\"object\"><div class=\"emoji\">" + result.second.imageEmoji + "</div><h3>" + result.second.name + "</h3><p>Diameter: " + result.second.diameterKm + " km</p><p>Gravity: " + result.second.gravityMs2 + " m/s2</p><p>Temp: " + result.second.meanTempC + " C</p></div>" +
    "</div><div class=\"card\"><p>Larger body: <b>" + result.metrics.largerBody + "</b></p><p>Heavier body: <b>" + result.metrics.heavierBody + "</b></p><p>Gravity ratio: <b>" + Number(result.metrics.gravityRatio).toFixed(2) + "x</b></p><p>Diameter ratio: <b>" + Number(result.metrics.diameterRatio).toFixed(2) + "x</b></p><p>Temp difference: <b>" + Number(result.metrics.tempDifference).toFixed(1) + " C</b></p></div>";
}

async function loadDestinations() {
  const destinations = await fetchJson("/api/destinations");
  const select = document.getElementById("destinationSelect");
  select.innerHTML = "";
  destinations.forEach((item) => {
    select.add(new Option(item.name + " (" + item.difficulty + ")", item.id));
  });
}

async function simulateMission() {
  const payload = {
    destinationId: document.getElementById("destinationSelect").value,
    spacecraftSpeedKms: Number(document.getElementById("speedInput").value),
    payloadKg: Number(document.getElementById("payloadInput").value),
    crewSize: Number(document.getElementById("crewInput").value)
  };
  const result = await fetchJson("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const box = document.getElementById("missionResult");
  const phases = result.phases.map((phase) => "<p>" + phase.name + ": " + Number(phase.durationDays).toFixed(1) + " days (" + phase.status + ")</p>").join("");
  box.innerHTML = "<div class=\"card\"><h3>" + result.destinationName + " — " + result.verdict + "</h3><p>Travel: <b>" + Number(result.travelDays).toFixed(1) + " days</b> | Fuel: <b>" + Number(result.fuelTons).toFixed(1) + " tons</b></p><p>Success: <b>" + Number(result.successChance).toFixed(1) + "%</b> | Difficulty: <b>" + result.difficulty + "</b></p><div class=\"bar\"><i style=\"width:" + result.successChance + "%\"></i></div>" + phases + "</div>";
}

async function loadQuizzes() {
  const category = document.getElementById("categoryFilter").value;
  state.quizzes = await fetchJson("/api/quizzes?category=" + encodeURIComponent(category));
  renderQuizzes();
}

function renderQuizzes() {
  const box = document.getElementById("quizBox");
  box.innerHTML = "";
  state.quizzes.forEach((item) => {
    const card = document.createElement("div");
    card.className = "quiz-q";
    const title = document.createElement("p");
    title.innerHTML = "<b>[" + item.category + "]</b> " + item.question;
    card.appendChild(title);
    item.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.onclick = async () => {
        const result = await fetchJson("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: state.userId, questionId: item.id, selectedIndex: index })
        });
        Array.from(card.querySelectorAll("button")).forEach((element) => { element.disabled = true; });
        button.classList.add(result.correct ? "correct" : "wrong");
        const info = document.createElement("p");
        info.textContent = (result.correct ? "Correct. " : "Wrong. ") + result.explanation;
        card.appendChild(info);
        await refreshProgress();
      };
      card.appendChild(button);
    });
    box.appendChild(card);
  });
}

async function toggleFavorite(objectId) {
  const result = await fetchJson("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: state.userId, objectId })
  });
  state.favorites = result.favorites || [];
  renderCatalog();
}

async function refreshProgress() {
  state.progress = await fetchJson("/api/progress?userId=" + state.userId);
  state.favorites = await fetchJson("/api/favorites?userId=" + state.userId);
  document.getElementById("progressBadge").textContent = state.progress.rank + " | " + state.progress.score + " pts";
  renderProgressBox();
}

function renderProgressBox() {
  const box = document.getElementById("progressBox");
  if (!state.progress) return;
  box.innerHTML = "<p>Score: <b>" + state.progress.score + "</b> | Answered: <b>" + state.progress.answered + "</b> | Correct: <b>" + state.progress.correctCount + "</b></p><p>Accuracy: <b>" + Number(state.progress.accuracy).toFixed(1) + "%</b> | Rank: <b>" + state.progress.rank + "</b> | Level " + state.progress.level + "</p><div class=\"bar\"><i style=\"width:" + state.progress.accuracy + "%\"></i></div>";
}

function renderFavorites() {
  renderProgressBox();
  const grid = document.getElementById("favoritesGrid");
  grid.innerHTML = "";
  const saved = state.objects.filter((item) => state.favorites.includes(item.id));
  if (saved.length === 0) {
    grid.innerHTML = "<p>No favorites yet. Save objects from the catalog.</p>";
    return;
  }
  saved.forEach((item) => {
    const card = document.createElement("div");
    card.className = "object";
    card.innerHTML = "<div class=\"emoji\">" + item.imageEmoji + "</div><h3>" + item.name + "</h3><p>" + item.description + "</p>";
    grid.appendChild(card);
  });
}

async function checkHealth() {
  try {
    await fetchJson("/api/health");
    document.getElementById("healthStatus").textContent = "Online • gRPC connected";
  } catch (error) {
    document.getElementById("healthStatus").textContent = "Offline";
  }
}

document.querySelectorAll(".tabs button").forEach((button) => {
  button.onclick = () => switchTab(button.dataset.tab);
});
document.getElementById("searchButton").onclick = loadCatalog;
document.getElementById("compareButton").onclick = comparePlanets;
document.getElementById("simulateButton").onclick = simulateMission;
document.getElementById("loadQuizButton").onclick = loadQuizzes;

loadCatalog();
loadDestinations();
loadQuizzes();
refreshProgress();
checkHealth();
