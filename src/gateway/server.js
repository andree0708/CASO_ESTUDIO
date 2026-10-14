const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const express = require("express");
const cors = require("cors");
const { z } = require("zod");
const { startGrpcServers } = require("../grpc/services");

const PORT = process.env.PORT || 3000;
const GRPC_ADDRESS = process.env.GRPC_ADDRESS || "0.0.0.0:50051";

const loaderOptions = {
  keepCase: false,
  longs: String,
  enums: Number,
  defaults: true,
  oneofs: true
};

function loadClient(file, first, second, service) {
  const def = protoLoader.loadSync(path.join(__dirname, "..", "..", "proto", file), loaderOptions);
  const loaded = grpc.loadPackageDefinition(def)[first][second];
  return new loaded[service](process.env.GRPC_TARGET || "localhost:50051", grpc.credentials.createInsecure());
}

function promisify(client, method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

const catalogClient = () => loadClient("catalog.proto", "astrolink", "catalog", "CatalogService");
const missionClient = () => loadClient("mission.proto", "astrolink", "mission", "MissionService");
const quizClient = () => loadClient("quiz.proto", "astrolink", "quiz", "QuizService");

let catalog;
let mission;
let quiz;

function getClients() {
  if (!catalog) {
    catalog = catalogClient();
    mission = missionClient();
    quiz = quizClient();
  }
  return { catalog, mission, quiz };
}

const listQuerySchema = z.object({
  type: z.string().optional().default(""),
  search: z.string().optional().default("")
});

const compareSchema = z.object({
  firstId: z.string().min(1),
  secondId: z.string().min(1)
});

const simulateSchema = z.object({
  destinationId: z.string().min(1),
  spacecraftSpeedKms: z.number().min(1).max(300000).default(20),
  payloadKg: z.number().min(0).max(1000000).default(1000),
  crewSize: z.number().int().min(0).max(20).default(1)
});

const submitSchema = z.object({
  userId: z.string().min(1).default("explorer-1"),
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0).max(3)
});

const favoriteSchema = z.object({
  userId: z.string().min(1).default("explorer-1"),
  objectId: z.string().min(1)
});

function toSuccess(data) {
  return { success: true, data };
}

function toError(res, error) {
  const code = error.code === 5 ? 404 : 500;
  return res.status(code).json({ success: false, error: error.message || "Internal error" });
}

function normalizeObject(item) {
  const types = ["UNKNOWN", "PLANET", "STAR", "GALAXY", "PHENOMENON"];
  return {
    id: item.id,
    name: item.name,
    type: types[item.type] || "UNKNOWN",
    description: item.description,
    distanceLightYears: item.distanceLightYears,
    diameterKm: item.diameterKm,
    massKg: item.massKg,
    gravityMs2: item.gravityMs2,
    dayLengthHours: item.dayLengthHours,
    yearLengthDays: item.yearLengthDays,
    meanTempC: item.meanTempC,
    imageEmoji: item.imageEmoji,
    habitable: item.habitable
  };
}

function startGateway() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "..", "public")));

  app.get("/api/health", async (req, res) => {
    res.json(toSuccess({ status: "ok", grpc: process.env.GRPC_TARGET || "localhost:50051", time: new Date().toISOString() }));
  });

  app.get("/api/objects", async (req, res) => {
    try {
      const query = listQuerySchema.parse(req.query);
      const { catalog } = getClients();
      const response = await promisify(catalog, "ListObjects", query);
      res.json(toSuccess((response.objects || []).map(normalizeObject)));
    } catch (error) {
      if (error.name === "ZodError") return res.status(400).json({ success: false, error: error.errors });
      toError(res, error);
    }
  });

  app.get("/api/objects/:id", async (req, res) => {
    try {
      const { catalog } = getClients();
      const response = await promisify(catalog, "GetObject", { id: req.params.id });
      res.json(toSuccess(normalizeObject(response)));
    } catch (error) {
      toError(res, error);
    }
  });

  app.post("/api/compare", async (req, res) => {
    try {
      const body = compareSchema.parse(req.body);
      const { catalog } = getClients();
      const response = await promisify(catalog, "ComparePlanets", body);
      res.json(toSuccess({
        first: normalizeObject(response.first),
        second: normalizeObject(response.second),
        metrics: response.metrics
      }));
    } catch (error) {
      if (error.name === "ZodError") return res.status(400).json({ success: false, error: error.errors });
      toError(res, error);
    }
  });

  app.get("/api/destinations", async (req, res) => {
    try {
      const { mission } = getClients();
      const response = await promisify(mission, "ListDestinations", {});
      res.json(toSuccess(response.destinations || []));
    } catch (error) {
      toError(res, error);
    }
  });

  app.post("/api/simulate", async (req, res) => {
    try {
      const body = simulateSchema.parse(req.body);
      const { mission } = getClients();
      const response = await promisify(mission, "SimulateMission", {
        destinationId: body.destinationId,
        spacecraftSpeedKms: body.spacecraftSpeedKms,
        payloadKg: body.payloadKg,
        crewSize: body.crewSize
      });
      res.json(toSuccess(response));
    } catch (error) {
      if (error.name === "ZodError") return res.status(400).json({ success: false, error: error.errors });
      toError(res, error);
    }
  });

  app.get("/api/quizzes", async (req, res) => {
    try {
      const category = String(req.query.category || "");
      const { quiz } = getClients();
      const response = await promisify(quiz, "ListQuizzes", { category });
      res.json(toSuccess(response.questions || []));
    } catch (error) {
      toError(res, error);
    }
  });

  app.post("/api/answer", async (req, res) => {
    try {
      const body = submitSchema.parse(req.body);
      const { quiz } = getClients();
      const response = await promisify(quiz, "SubmitAnswer", body);
      res.json(toSuccess(response));
    } catch (error) {
      if (error.name === "ZodError") return res.status(400).json({ success: false, error: error.errors });
      toError(res, error);
    }
  });

  app.get("/api/progress", async (req, res) => {
    try {
      const userId = String(req.query.userId || "explorer-1");
      const { quiz } = getClients();
      const response = await promisify(quiz, "GetProgress", { userId });
      res.json(toSuccess(response));
    } catch (error) {
      toError(res, error);
    }
  });

  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = String(req.query.userId || "explorer-1");
      const { quiz } = getClients();
      const response = await promisify(quiz, "ListFavorites", { userId });
      res.json(toSuccess(response.favorites || []));
    } catch (error) {
      toError(res, error);
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const body = favoriteSchema.parse(req.body);
      const { quiz } = getClients();
      const response = await promisify(quiz, "ToggleFavorite", body);
      res.json(toSuccess(response));
    } catch (error) {
      if (error.name === "ZodError") return res.status(400).json({ success: false, error: error.errors });
      toError(res, error);
    }
  });

  app.listen(PORT, () => {});
  return app;
}

if (require.main === module) {
  process.env.GRPC_TARGET = "localhost:50051";
  const grpcServer = startGrpcServers();
  grpcServer.bindAsync(GRPC_ADDRESS, grpc.ServerCredentials.createInsecure(), (error) => {
    if (error) {
      throw error;
    }
    startGateway();
  });
}

module.exports = { startGateway, getClients };
