const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const store = require("../data/store");

const loaderOptions = {
  keepCase: false,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true
};

function loadProto(file, first, second) {
  const def = protoLoader.loadSync(path.join(__dirname, "..", "..", "proto", file), loaderOptions);
  return grpc.loadPackageDefinition(def)[first][second];
}

const catalogPkg = loadProto("catalog.proto", "astrolink", "catalog");
const missionPkg = loadProto("mission.proto", "astrolink", "mission");
const quizPkg = loadProto("quiz.proto", "astrolink", "quiz");

const typeNames = { 1: "PLANET", 2: "STAR", 3: "GALAXY", 4: "PHENOMENON" };

function toObjectType(value) {
  if (!value) return 0;
  const upper = String(value).toUpperCase();
  const found = Object.entries(typeNames).find((entry) => entry[1] === upper);
  return found ? Number(found[0]) : 0;
}

function toCatalogObject(item) {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    description: item.description,
    distanceLightYears: item.distance_light_years,
    diameterKm: item.diameter_km,
    massKg: item.mass_kg,
    gravityMs2: item.gravity_ms2,
    dayLengthHours: item.day_length_hours,
    yearLengthDays: item.year_length_days,
    meanTempC: item.mean_temp_c,
    imageEmoji: item.image_emoji,
    habitable: item.habitable
  };
}

function toDestinationObject(item) {
  return {
    id: item.id,
    name: item.name,
    distanceKm: item.distance_km,
    gravityMs2: item.gravity_ms2,
    difficulty: item.difficulty
  };
}

function toProgressObject(record) {
  return {
    userId: record.user_id,
    score: record.score,
    answered: record.answered,
    correctCount: record.correct_count,
    accuracy: record.accuracy,
    level: record.level,
    rank: record.rank
  };
}

const catalogService = {
  ListObjects(call, callback) {
    const typeFilter = toObjectType(call.request.type);
    const search = (call.request.search || "").toLowerCase();
    let result = store.objects;
    if (typeFilter !== 0) {
      result = result.filter((item) => item.type === typeFilter);
    }
    if (search) {
      result = result.filter((item) => item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search));
    }
    callback(null, { objects: result.map(toCatalogObject) });
  },
  GetObject(call, callback) {
    const found = store.objects.find((item) => item.id === call.request.id);
    if (!found) {
      return callback({ code: grpc.status.NOT_FOUND, message: "Object not found" });
    }
    callback(null, toCatalogObject(found));
  },
  ComparePlanets(call, callback) {
    const first = store.objects.find((item) => item.id === call.request.firstId);
    const second = store.objects.find((item) => item.id === call.request.secondId);
    if (!first || !second) {
      return callback({ code: grpc.status.NOT_FOUND, message: "Planet not found" });
    }
    const metrics = {
      gravityRatio: second.gravity_ms2 === 0 ? 0 : first.gravity_ms2 / second.gravity_ms2,
      diameterRatio: second.diameter_km === 0 ? 0 : first.diameter_km / second.diameter_km,
      distanceDifference: Math.abs(first.distance_light_years - second.distance_light_years),
      tempDifference: Math.abs(first.mean_temp_c - second.mean_temp_c),
      largerBody: first.diameter_km >= second.diameter_km ? first.name : second.name,
      heavierBody: first.mass_kg >= second.mass_kg ? first.name : second.name
    };
    callback(null, { first: toCatalogObject(first), second: toCatalogObject(second), metrics });
  }
};

const missionService = {
  ListDestinations(call, callback) {
    callback(null, { destinations: store.destinations.map(toDestinationObject) });
  },
  SimulateMission(call, callback) {
    const request = call.request;
    const destination = store.destinations.find((item) => item.id === request.destinationId);
    if (!destination) {
      return callback({ code: grpc.status.NOT_FOUND, message: "Destination not found" });
    }
    const speed = request.spacecraftSpeedKms || 20;
    const payload = request.payloadKg || 1000;
    const crew = request.crewSize || 1;
    const travelSeconds = destination.distance_km / speed;
    const travelDays = travelSeconds / 86400;
    const fuelTons = (destination.distance_km / 1e6) * (1 + payload / 10000) * (1 + crew * 0.15) * 0.42;
    let successChance = 95 - Math.log10(destination.distance_km + 10) * 6 - crew * 2 - (payload / 5000);
    if (speed < 10) successChance -= 10;
    if (speed > 100) successChance -= 5;
    successChance = Math.max(2, Math.min(99, successChance));
    const launchDays = Math.min(3, travelDays * 0.02 + 0.5);
    const cruiseDays = Math.max(0, travelDays - launchDays - 2);
    const phases = [
      { name: "Launch", durationDays: launchDays, status: "Nominal" },
      { name: "Cruise", durationDays: cruiseDays, status: cruiseDays > 1000 ? "Long duration" : "Nominal" },
      { name: "Landing", durationDays: 2, status: destination.gravity_ms2 > 15 ? "High gravity risk" : "Nominal" }
    ];
    let verdict = "Go for launch";
    if (successChance < 30) verdict = "Mission too risky";
    else if (successChance < 60) verdict = "Risky but possible";
    else if (successChance < 85) verdict = "Feasible mission";
    callback(null, {
      destinationId: destination.id,
      destinationName: destination.name,
      distanceKm: destination.distance_km,
      travelDays,
      fuelTons,
      successChance,
      difficulty: destination.difficulty,
      phases,
      verdict
    });
  }
};

const quizService = {
  ListQuizzes(call, callback) {
    const category = (call.request.category || "").toLowerCase();
    let result = store.quizzes.map((item) => ({
      id: item.id,
      category: item.category,
      question: item.question,
      options: item.options,
      correctIndex: 0,
      explanation: ""
    }));
    if (category) {
      result = result.filter((item, index) => store.quizzes[index].category === category);
    }
    callback(null, { questions: result });
  },
  SubmitAnswer(call, callback) {
    const request = call.request;
    const question = store.quizzes.find((item) => item.id === request.questionId);
    if (!question) {
      return callback({ code: grpc.status.NOT_FOUND, message: "Question not found" });
    }
    const correct = request.selectedIndex === question.correct_index;
    const record = store.getProgressRecord(request.userId || "explorer-1");
    record.answered += 1;
    if (correct) {
      record.correct_count += 1;
      record.score += 50;
    } else {
      record.score = Math.max(0, record.score - 10);
    }
    record.accuracy = record.answered === 0 ? 0 : (record.correct_count / record.answered) * 100;
    store.updateRank(record);
    callback(null, {
      correct,
      explanation: question.explanation,
      score: record.score,
      answered: record.answered,
      correctCount: record.correct_count,
      accuracy: record.accuracy
    });
  },
  GetProgress(call, callback) {
    const record = store.getProgressRecord(call.request.userId || "explorer-1");
    callback(null, toProgressObject(record));
  },
  ToggleFavorite(call, callback) {
    const userId = call.request.userId || "explorer-1";
    const objectId = call.request.objectId;
    if (!store.objects.find((item) => item.id === objectId)) {
      return callback({ code: grpc.status.NOT_FOUND, message: "Object not found" });
    }
    if (!store.favorites[userId]) {
      store.favorites[userId] = new Set();
    }
    const set = store.favorites[userId];
    let favorite = false;
    if (set.has(objectId)) {
      set.delete(objectId);
    } else {
      set.add(objectId);
      favorite = true;
    }
    callback(null, { objectId, favorite, favorites: Array.from(set) });
  },
  ListFavorites(call, callback) {
    const userId = call.request.userId || "explorer-1";
    const set = store.favorites[userId] || new Set();
    callback(null, { favorites: Array.from(set) });
  }
};

function startGrpcServers() {
  const server = new grpc.Server();
  server.addService(catalogPkg.CatalogService.service, catalogService);
  server.addService(missionPkg.MissionService.service, missionService);
  server.addService(quizPkg.QuizService.service, quizService);
  return server;
}

if (require.main === module) {
  const address = process.env.GRPC_ADDRESS || "0.0.0.0:50051";
  const server = startGrpcServers();
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (error) => {
    if (error) {
      throw error;
    }
    server.start();
  });
}

module.exports = {
  startGrpcServers,
  catalogService,
  missionService,
  quizService
};
