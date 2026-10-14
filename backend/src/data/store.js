const objects = [
  {
    id: "mercury",
    name: "Mercury",
    type: 1,
    description: "Smallest planet and closest to the Sun with extreme temperature swings.",
    distance_light_years: 0.0000158,
    diameter_km: 4879,
    mass_kg: 3.301e23,
    gravity_ms2: 3.7,
    day_length_hours: 4222.6,
    year_length_days: 88,
    mean_temp_c: 167,
    image_emoji: "☿️",
    habitable: false
  },
  {
    id: "venus",
    name: "Venus",
    type: 1,
    description: "Hottest planet with a thick CO2 atmosphere and crushing pressure.",
    distance_light_years: 0.0000117,
    diameter_km: 12104,
    mass_kg: 4.867e24,
    gravity_ms2: 8.87,
    day_length_hours: 2802,
    year_length_days: 225,
    mean_temp_c: 464,
    image_emoji: "♀️",
    habitable: false
  },
  {
    id: "earth",
    name: "Earth",
    type: 1,
    description: "Our home planet, the only known world with life and liquid water oceans.",
    distance_light_years: 0.0000158,
    diameter_km: 12742,
    mass_kg: 5.972e24,
    gravity_ms2: 9.81,
    day_length_hours: 24,
    year_length_days: 365.25,
    mean_temp_c: 15,
    image_emoji: "🌍",
    habitable: true
  },
  {
    id: "mars",
    name: "Mars",
    type: 1,
    description: "The red planet, target for human missions with the tallest volcano.",
    distance_light_years: 0.0000249,
    diameter_km: 6779,
    mass_kg: 6.417e23,
    gravity_ms2: 3.71,
    day_length_hours: 24.7,
    year_length_days: 687,
    mean_temp_c: -63,
    image_emoji: "🔴",
    habitable: false
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: 1,
    description: "Gas giant with the Great Red Spot storm larger than Earth.",
    distance_light_years: 0.0000829,
    diameter_km: 139820,
    mass_kg: 1.898e27,
    gravity_ms2: 24.79,
    day_length_hours: 9.9,
    year_length_days: 4331,
    mean_temp_c: -110,
    image_emoji: "🪐",
    habitable: false
  },
  {
    id: "saturn",
    name: "Saturn",
    type: 1,
    description: "Famous for its bright icy rings made of rock and ice particles.",
    distance_light_years: 0.0001509,
    diameter_km: 116460,
    mass_kg: 5.683e26,
    gravity_ms2: 10.44,
    day_length_hours: 10.7,
    year_length_days: 10747,
    mean_temp_c: -140,
    image_emoji: "🪐",
    habitable: false
  },
  {
    id: "sun",
    name: "Sun",
    type: 2,
    description: "G-type star containing 99.8 percent of the Solar System mass.",
    distance_light_years: 0.0000158,
    diameter_km: 1392700,
    mass_kg: 1.989e30,
    gravity_ms2: 274,
    day_length_hours: 609.12,
    year_length_days: 0,
    mean_temp_c: 5505,
    image_emoji: "☀️",
    habitable: false
  },
  {
    id: "sirius",
    name: "Sirius",
    type: 2,
    description: "Brightest star in the night sky, a binary system in Canis Major.",
    distance_light_years: 8.6,
    diameter_km: 2370000,
    mass_kg: 4.176e30,
    gravity_ms2: 178,
    day_length_hours: 0,
    year_length_days: 0,
    mean_temp_c: 9940,
    image_emoji: "✨",
    habitable: false
  },
  {
    id: "milky-way",
    name: "Milky Way",
    type: 3,
    description: "Our barred spiral galaxy with 100 to 400 billion stars.",
    distance_light_years: 0,
    diameter_km: 9.46e17,
    mass_kg: 2.9e42,
    gravity_ms2: 0,
    day_length_hours: 0,
    year_length_days: 0,
    mean_temp_c: 0,
    image_emoji: "🌌",
    habitable: false
  },
  {
    id: "andromeda",
    name: "Andromeda",
    type: 3,
    description: "Nearest spiral galaxy, on collision course with the Milky Way.",
    distance_light_years: 2537000,
    diameter_km: 2.08e18,
    mass_kg: 3e42,
    gravity_ms2: 0,
    day_length_hours: 0,
    year_length_days: 0,
    mean_temp_c: 0,
    image_emoji: "🌠",
    habitable: false
  },
  {
    id: "black-hole",
    name: "Gargantua Black Hole",
    type: 4,
    description: "Supermassive black hole with gravity so strong that light cannot escape.",
    distance_light_years: 100000000,
    diameter_km: 160000000,
    mass_kg: 2e38,
    gravity_ms2: 0,
    day_length_hours: 0,
    year_length_days: 0,
    mean_temp_c: -270,
    image_emoji: "🕳️",
    habitable: false
  },
  {
    id: "europa",
    name: "Europa",
    type: 1,
    description: "Icy moon of Jupiter with a subsurface ocean, candidate for life.",
    distance_light_years: 0.0000829,
    diameter_km: 3122,
    mass_kg: 4.8e22,
    gravity_ms2: 1.31,
    day_length_hours: 85.2,
    year_length_days: 3.55,
    mean_temp_c: -160,
    image_emoji: "🧊",
    habitable: false
  }
];

const destinations = [
  { id: "moon", name: "Moon", distance_km: 384400, gravity_ms2: 1.62, difficulty: "EASY" },
  { id: "mars", name: "Mars", distance_km: 225000000, gravity_ms2: 3.71, difficulty: "MEDIUM" },
  { id: "europa", name: "Europa", distance_km: 628000000, gravity_ms2: 1.31, difficulty: "HARD" },
  { id: "jupiter", name: "Jupiter", distance_km: 778000000, gravity_ms2: 24.79, difficulty: "EXTREME" },
  { id: "sirius", name: "Sirius", distance_km: 8.136e13, gravity_ms2: 178, difficulty: "IMPOSSIBLE" }
];

const quizzes = [
  {
    id: "q1",
    category: "planets",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Mercury"],
    correct_index: 1,
    explanation: "Mars looks red because of iron oxide dust on its surface."
  },
  {
    id: "q2",
    category: "planets",
    question: "Which planet has the most visible ring system?",
    options: ["Jupiter", "Neptune", "Saturn", "Earth"],
    correct_index: 2,
    explanation: "Saturn rings are made of bright ice and rock particles."
  },
  {
    id: "q3",
    category: "stars",
    question: "What type of star is the Sun?",
    options: ["Red giant", "White dwarf", "G-type main sequence", "Neutron star"],
    correct_index: 2,
    explanation: "The Sun is a G-type main-sequence star called a yellow dwarf."
  },
  {
    id: "q4",
    category: "stars",
    question: "Which is the brightest star in the night sky?",
    options: ["Polaris", "Sirius", "Betelgeuse", "Vega"],
    correct_index: 1,
    explanation: "Sirius in Canis Major is the brightest star seen from Earth."
  },
  {
    id: "q5",
    category: "galaxies",
    question: "Which galaxy will collide with the Milky Way?",
    options: ["Triangulum", "Andromeda", "Large Magellanic Cloud", "Sombrero"],
    correct_index: 1,
    explanation: "Andromeda approaches us and will merge in about 4.5 billion years."
  },
  {
    id: "q6",
    category: "missions",
    question: "How long does light from the Sun take to reach Earth?",
    options: ["8 seconds", "8 minutes", "8 hours", "8 days"],
    correct_index: 1,
    explanation: "Sunlight travels about 8 minutes and 20 seconds to reach Earth."
  }
];

const progress = {};
const favorites = {};

function getProgressRecord(userId) {
  if (!progress[userId]) {
    progress[userId] = { user_id: userId, score: 0, answered: 0, correct_count: 0, accuracy: 0, level: 1, rank: "Cadet" };
  }
  return progress[userId];
}

function updateRank(record) {
  if (record.score >= 500) {
    record.level = 5;
    record.rank = "Commander";
  } else if (record.score >= 300) {
    record.level = 4;
    record.rank = "Pilot";
  } else if (record.score >= 150) {
    record.level = 3;
    record.rank = "Explorer";
  } else if (record.score >= 50) {
    record.level = 2;
    record.rank = "Trainee";
  } else {
    record.level = 1;
    record.rank = "Cadet";
  }
}

module.exports = {
  objects,
  destinations,
  quizzes,
  progress,
  favorites,
  getProgressRecord,
  updateRank
};
