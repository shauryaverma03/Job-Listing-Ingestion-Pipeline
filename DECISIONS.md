# ACDYON Technologies Engineering Challenge — DECISIONS.md

## 1. Ingestion Strategy Choice

### Selected Strategy: Public Structured Interfaces (APIs & RSS Feeds)
We selected structured public interfaces (RemoteOK JSON API & WeWorkRemotely RSS feed) over browser automation tools like Puppeteer or Playwright.

### Why this over the obvious alternative (Headless Browser Scraping)?
- **Detection Surface & Operational Stability**: Headless browsers incur heavy memory overhead, fragile CSS selector dependencies, and elevated detection surface vectors (WebRTC leakage, canvas fingerprinting, CDP detection). Public APIs/RSS provide low-risk, structured data contracts that do not trigger anti-bot challenges or violate platform ToS.
- **Resource Efficiency & Pacing**: HTTP-level API ingestion enables microsecond response times and deterministic token-bucket pacing (10 req/min) without rendering client-side JavaScript or executing unneeded network assets.

---

## 2. Time-Limit Trade-off & Future Production Architecture

### Time-Limit Trade-off Made
**In-Memory Queue & SQLite Storage**: For single-command local execution (`npm install && npm run dev`), we used an in-memory worker queue paired with a WAL-mode SQLite database (`better-sqlite3`).

### What I Would Implement With a Real Week
1. **Distributed Queue (Redis & BullMQ)**: Replace the in-memory queue with Redis BullMQ to enable distributed task locking, dead-letter queues, and horizontal worker scaling across independent cloud nodes.
2. **PostgreSQL & Schema Migration Engine**: Replace SQLite with PostgreSQL managed on Cloud SQL / Supabase with Knex/Prisma migration tracking for zero-downtime schema updates.
3. **Adaptive Proxy Rotation**: Integrate residential HTTP proxy rotation with automated health checks to prevent single-IP throttling across multi-region feeds.

---

## 3. AI Tool Transparency & Verification

### AI Assistance (Claude, ChatGPT, Antigravity)
AI tools were used as technical pair-programming assistants for:
- Initial architectural brainstorming and component boundary design.
- Drafting initial boilerplate code for the Token-Bucket and 3-State Circuit Breaker state machines.
- Reviewing edge-case coverage for exponential backoff retry jitter formulas.

### Personal Verification & Modifications Made
1. **Custom State Machine Debugging**: I personally audited the Circuit Breaker transition logic to verify that `HALF_OPEN` state correctly enforces a 1-request trial limit before closing or re-opening.
2. **Parsing & Fail-Safe Normalization**: I updated source normalizers to wrap individual item parsing in `try/catch` loops, preventing single malformed items from crashing entire feed batches.
3. **Automated Testing Suite**: I wrote and verified the deterministic unit test suite (`tests/pipeline.test.js`) using Node’s built-in `node:test` runner to validate rate limiting, deduplication, retry handling, and fallback behavior without invoking live external endpoints.
