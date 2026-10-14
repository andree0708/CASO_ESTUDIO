# AstroLink Space Explorer

Split layout for clean deploy:

- `backend/` -> Node + Express gateway + 3 gRPC services. Deploy on Render or Railway.
- `frontend/` -> Static site. Deploy on Vercel.

## Architecture

Contract-first with three proto services in `backend/proto`:

- `catalog.proto` -> CatalogService: ListObjects, GetObject, ComparePlanets
- `mission.proto` -> MissionService: ListDestinations, SimulateMission
- `quiz.proto` -> QuizService: ListQuizzes, SubmitAnswer, GetProgress, ToggleFavorite, ListFavorites

```
Browser --REST/JSON--> Express Gateway --gRPC--> CatalogService
                                        \------> MissionService
                                         \-----> QuizService
```

Browsers cannot speak gRPC directly, the gateway translates REST to gRPC.
Gateway adds runtime parsing with Zod.

## Local run

Backend:

```powershell
Set-Location backend
npm install
npm start
```

Backend runs at http://localhost:3000. Check http://localhost:3000/api/health.

Frontend local:

Option 1: open `frontend/index.html` with Live Server, it calls http://localhost:3000 automatically on localhost.

Option 2: serve static:

```powershell
npx serve frontend
```

## Deploy backend on Render

- New > Web Service > connect repo
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Or Docker: it detects `backend/Dockerfile`

## Deploy frontend on Vercel

- New Project > import repo
- Root Directory: `frontend`
- No build command, output: `.`
- Edit `frontend/vercel.json` and replace `https://astrolink-backend.onrender.com` with your real Render URL
- Vercel proxies `/api/*` to Render, so the frontend keeps calling relative `/api`

Without proxy, set `frontend/config.js`:

```js
window.ASTROLINK_API_URL = "https://your-backend.onrender.com";
```

## Features

- Celestial object catalog with search and type filter
- Planet comparator with gravity and size ratios
- Mission simulator with travel time, fuel and success chance
- Astronomy quizzes with score, accuracy, level and rank
- Favorites and user progress
