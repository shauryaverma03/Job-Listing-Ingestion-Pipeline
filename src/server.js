import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { config } from './config/env.js';
import { logger } from './logger/logger.js';
import { initDatabase } from './storage/db.js';
import { workerPool, jobQueue } from './queue/jobQueue.js';
import { apiRouter } from './api/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve static frontend assets in production / Render deployment
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('API is running. Dashboard build static assets not found. Run "npm run dev" to launch both dev servers.');
    }
  });
});

// Startup Initialization
try {
  initDatabase();
  workerPool.start();

  // Enqueue initial fetch job on server startup
  logger.info('Server', 'Enqueuing initial startup fetch job...');
  jobQueue.enqueue('FETCH_LISTINGS', { trigger: 'startup' });

  // Schedule Cron Job
  if (cron.validate(config.FETCH_CRON_SCHEDULE)) {
    cron.schedule(config.FETCH_CRON_SCHEDULE, () => {
      logger.info('Cron', `Scheduled cron triggered (${config.FETCH_CRON_SCHEDULE}). Enqueuing fetch job...`);
      jobQueue.enqueue('FETCH_LISTINGS', { trigger: 'cron' });
    });
    logger.info('Cron', `Cron schedule active: "${config.FETCH_CRON_SCHEDULE}"`);
  } else {
    logger.warn('Cron', `Invalid cron expression "${config.FETCH_CRON_SCHEDULE}". Defaulting to setInterval 5 mins.`);
    setInterval(() => {
      jobQueue.enqueue('FETCH_LISTINGS', { trigger: 'interval' });
    }, 5 * 60 * 1000);
  }

  app.listen(config.PORT, () => {
    logger.info('Server', `🚀 Ingestion pipeline server running on http://localhost:${config.PORT}`);
    logger.info('Server', `Environment: ${config.NODE_ENV} | Rate Limit: ${config.RATE_LIMIT_PER_MIN} req/min | CB Threshold: ${config.CB_FAILURE_THRESHOLD}`);
  });
} catch (err) {
  logger.error('Server', 'Fatal startup error', { error: err.message });
  process.exit(1);
}
