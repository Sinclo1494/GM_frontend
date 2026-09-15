# GM Groupe Frontend

React + TypeScript + Vite application for the GM Groupe management platform.

## Development

```bash
npm install
npm run dev
```

The development server uses the backend at `http://localhost:8000` via the `.env` configuration.

## Production Build

```bash
npm install
npm run build
```

The production build outputs static files to `dist/`.

### Build Script (Windows)

A PowerShell build script is provided:

```powershell
.\scripts\build-production.ps1
```

Options:
- `-Clean` — removes the previous `dist/` before building
- `-SkipTests` — skips the test run during the build

## Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | `/api` |

- `.env` — development configuration (tracked)
- `.env.production` — production configuration (tracked, non-secret)
- `.env.example` — example values for reference
- `.env.local` — local overrides (gitignored)

Do not place secrets, passwords, or API keys in `VITE_*` variables. Vite environment variables are embedded in the frontend bundle and are publicly visible.

## IIS Deployment

### Prerequisites

The production Windows Server requires:

- IIS
- IIS URL Rewrite module
- IIS Application Request Routing (ARR)

Node.js, npm, React, and Vite are **not** required on the production server when deploying a pre-built static bundle.

### Directory Structure

Deploy the contents of `dist/` to the IIS site root, for example:

```
C:\inetpub\wwwroot\GM-Groupe\
    index.html
    assets\
    web.config
```

### SPA Routing

The `web.config` included in `dist/` configures IIS URL Rewrite to:

1. Serve real files and directories directly
2. Exclude `/api/*` from the React fallback (leaves it for ARR reverse proxy)
3. Rewrite all other routes to `index.html` for client-side routing

### Reverse Proxy

Configure IIS ARR to reverse-proxy `/api/*` requests to the Django/Waitress backend.

Example ARR rule:

- Pattern: `^api/(.*)`
- Action: Reverse proxy to `http://localhost:8000/api/{R:1}`

### Caching

- `index.html` should be served with `no-cache` headers so users always receive the latest application version
- Hashed assets in `dist/assets/` can be cached aggressively

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (TypeScript + Vite) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `scripts\build-production.ps1` | Full production build script (Windows) |

## Tech Stack

- React 19
- Vite 8
- TypeScript 6
- Tailwind CSS 4
- Material UI 9
- React Router 7
- Axios
- Chart.js + react-chartjs-2
- Vitest
