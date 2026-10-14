# AstroLink Space Explorer

Web programming case study: space catalog with gRPC microservices.

## Architecture

Contract-first with three proto services:

- `proto/catalog.proto` -> CatalogService: ListObjects, GetObject, ComparePlanets
- `proto/mission.proto` -> MissionService: ListDestinations, SimulateMission
- `proto/quiz.proto` -> QuizService: ListQuizzes, SubmitAnswer, GetProgress, ToggleFavorite, ListFavorites

Browsers cannot speak gRPC directly, so the project uses a gateway pattern:

```
Browser --REST/JSON--> Express Gateway --gRPC--> CatalogService
                                        \------> MissionService
                                         \-----> QuizService
```

Gateway adds runtime parsing with Zod because TypeScript types disappear at runtime.

## Run

```powershell
npm install
npm start
```

Open http://localhost:3000

## Features

- Celestial object catalog with search and type filter
- Planet comparator with gravity and size ratios
- Mission simulator with travel time, fuel and success chance
- Astronomy quizzes with score, accuracy, level and rank
- Favorites and user progress

## Course mapping

- Contract-First: protos are the single source of truth
- End-to-end typing: proto -> gateway normalization -> frontend rendering
- Runtime safety: Zod parsing before calling gRPC
- gRPC: binary contracts, strongly typed procedures, three independent services
