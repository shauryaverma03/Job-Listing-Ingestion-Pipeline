# Resilient Job Ingestion Pipeline & Dashboard

A production-grade, fault-tolerant job listing ingestion pipeline and monitoring dashboard built with Node.js, Express, SQLite, and React + Vite.

Designed as an architectural demonstration of resilient distributed ingestion patterns — including **Token-Bucket Rate Limiting**, **Exponential Backoff with Jitter**, **3-State Circuit Breakers**, **Stateless Worker Pool Queues**, **Multi-Tier Fallbacks**, and **Storage Deduplication**.

---

## Key Resilience Architecture Features

### 1. Fetcher Service (`/src/fetcher/`)
- Ingests public job postings on a automated schedule (every 5 minutes via `node-cron` or `setInterval`) or via manual API trigger.
- **Primary Source**: [RemoteOK API](https://remoteok.com/api) (JSON endpoint).
- **Secondary Source**: [WeWorkRemotely RSS](https://weworkremotely.com/remote-jobs.rss) (RSS XML feed).
- Normalizes disparate feed formats into a uniform canonical schema:
  `{ id, title, company, location, url, source, fetchedAt, tags, salary, description, isStale }`.

### 2. Token-Bucket Rate Limiter (`/src/rateLimiter/`)
- Custom `TokenBucketRateLimiter` capping requests per source per minute.
- Configurable via `RATE_LIMIT_PER_MIN=10` env variable.
- Supports continuous token refills and async token acquisition waiting.

### 3. Retry with Exponential Backoff + Jitter (`/src/fetcher/retry.js`)
- Wraps external network calls. Automatically retries transient errors (timeouts, HTTP 5xx, HTTP 429, network failures).
- Formula: `delay = Math.min(maxDelay, baseDelay * (2 ^ attempt) + randomJitter)`.
- Max 3-4 attempts (configurable via `MAX_RETRIES=3`).

### 4. 3-State Circuit Breaker (`/src/circuitBreaker/`)
- State Machine: `CLOSED` ➔ `OPEN` ➔ `HALF_OPEN` ➔ `CLOSED`.
- Trips to `OPEN` after `CB_FAILURE_THRESHOLD=5` consecutive errors to protect external services and fast-fail pipeline tasks.
- Enforces a `CB_COOLDOWN_MS=30000` (30s) cooldown before transitioning to `HALF_OPEN` to test recovery with a trial request.
- State metrics exposed live via `/api/status`.

### 5. Queue & Worker Pool (`/src/queue/`)
- In-memory async job queue processed by `WORKER_CONCURRENCY=2` worker loops.
- **Stateless Worker Design**: Workers pull pending tasks, execute fetch routines, update SQLite storage, and record health metrics.
- *Horizontal Scaling Note*: In multi-node production environments (Kubernetes, AWS ECS, Render instances), the queue can be swapped 1-to-1 with Redis (`BullMQ`) without changing worker logic.

### 6. Multi-Tier Fallback / Plan B (`/src/fetcher/fetcherService.js`)
- **Tier 1**: Fetch from Primary Source (`RemoteOK`).
- **Tier 2**: If Primary Circuit Breaker is `OPEN` or fetch fails, automatically fall back to Secondary Source (`WeWorkRemotely RSS`).
- **Tier 3**: If both live sources fail or are `OPEN`, serve last-known-good cached data from SQLite storage, marked with a prominent `isStale: true` flag.

### 7. Storage & Deduplication (`/src/storage/`)
- Zero-dependency local persistence using `better-sqlite3`.
- Deduplicates incoming listings based on unique normalized `id` and `url`/`title+company` hash. Updates existing records or inserts new ones.

### 8. Structured Logging (`/src/logger/`)
- ISO-timestamped console output with component tags `[Fetcher]`, `[RateLimiter]`, `[CircuitBreaker]`, `[Queue]`, `[Storage]`.
- Rolling in-memory log buffer accessible via API `/api/logs` and visible in the React Dashboard modal.

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/listings` | Paginated, searchable job listings (`?page=1&limit=12&search=react&source=RemoteOK`) |
| `GET` | `/api/status` | Pipeline health: total requests, success rate %, circuit breaker states, rate limiter tokens |
| `POST` | `/api/fetch/trigger` | Manually enqueue an immediate ingestion job |
| `GET` | `/api/logs` | Real-time structured console logs stream |

---

## Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Single Command Setup & Run

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Run both Backend Express server (Port 5001) and React Vite dashboard (Port 5173) concurrently:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   - **Dashboard**: `http://localhost:5173`
   - **Backend API Status**: `http://localhost:5001/api/status`

---

## Environment Variables (`.env`)

Copy `.env.example` to `.env` to customize settings:

```ini
# Server Port
PORT=5001
NODE_ENV=development

# Token-Bucket Rate Limiter (Requests per source per minute)
RATE_LIMIT_PER_MIN=10

# Retry & Exponential Backoff
MAX_RETRIES=3
INITIAL_RETRY_DELAY_MS=1000
MAX_RETRY_DELAY_MS=10000

# Circuit Breaker Thresholds
CB_FAILURE_THRESHOLD=5
CB_COOLDOWN_MS=30000

# Worker Pool Concurrency
WORKER_CONCURRENCY=2

# Cron Schedule (Default: Every 5 minutes)
FETCH_CRON_SCHEDULE=*/5 * * * *

# Public Feed Data Sources
PRIMARY_SOURCE_URL=https://remoteok.com/api
SECONDARY_SOURCE_URL=https://weworkremotely.com/remote-jobs.rss

# Database Path
DB_PATH=./pipeline.db
```

---

## Render Deployment Readiness

To deploy to [Render](https://render.com):

1. Set **Build Command**:
   ```bash
   npm install && npm --prefix client run build
   ```
2. Set **Start Command**:
   ```bash
   npm start
   ```
3. Add Environment Variables from `.env.example` in the Render dashboard.

---

## Project Directory Layout

```
.
├── .env
├── .env.example
├── README.md
├── package.json
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       └── components/
│           ├── Header.jsx
│           ├── MetricsOverview.jsx
│           ├── CircuitBreakerCard.jsx
│           ├── ListingsExplorer.jsx
│           └── LogViewerModal.jsx
└── src/
    ├── config/
    │   └── env.js
    ├── logger/
    │   └── logger.js
    ├── storage/
    │   └── db.js
    ├── rateLimiter/
    │   └── tokenBucket.js
    ├── circuitBreaker/
    │   └── circuitBreaker.js
    ├── fetcher/
    │   ├── retry.js
    │   ├── sources/
    │   │   ├── remoteok.js
    │   │   └── weworkremotely.js
    │   └── fetcherService.js
    ├── queue/
    │   └── jobQueue.js
    ├── api/
    │   └── routes.js
    └── server.js
```
