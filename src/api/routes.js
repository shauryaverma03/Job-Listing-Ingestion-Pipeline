import express from 'express';
import { getListings, getStorageStats, initDatabase } from '../storage/db.js';
import {
  rateLimiterManager,
  circuitBreakerManager,
  setSimulatedFailure,
  getSimulatedFailures,
  resetSimulatedFailures
} from '../fetcher/fetcherService.js';
import { jobQueue, workerPool } from '../queue/jobQueue.js';
import { getRecentLogs } from '../logger/logger.js';
import { config } from '../config/env.js';

export const apiRouter = express.Router();

const serverStartTime = Date.now();

/**
 * GET /api/health
 * Simple health status endpoint
 */
apiRouter.get('/health', (req, res) => {
  try {
    const db = initDatabase();
    const isDbConnected = Boolean(db);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
      database: isDbConnected ? 'connected' : 'disconnected',
      environment: config.NODE_ENV
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/listings
 * Paginated and searchable normalized job listings
 */
apiRouter.get('/listings', (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '12', 10);
    const search = req.query.search || '';
    const source = req.query.source || '';

    const result = getListings({ page, limit, search, source });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve listings', details: err.message });
  }
});

/**
 * GET /api/status
 * Pipeline health, circuit breaker states, rate limiters, storage metrics, worker pool, and failure simulations
 */
apiRouter.get('/status', (req, res) => {
  try {
    const storageStats = getStorageStats();
    const breakerStats = circuitBreakerManager.getStatus();
    const rateLimitStats = rateLimiterManager.getStatus();
    const workerStats = workerPool.getStats();
    const simulatedFailures = getSimulatedFailures();

    let totalRequests = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    for (const b of Object.values(breakerStats)) {
      totalRequests += b.totalRequests;
      totalSuccess += b.successfulRequests;
      totalFailed += b.failedRequests;
    }

    const overallSuccessRate = totalRequests > 0 ? Math.round((totalSuccess / totalRequests) * 100) : 100;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      config: {
        rateLimitPerMin: config.RATE_LIMIT_PER_MIN,
        maxRetries: config.MAX_RETRIES,
        cbThreshold: config.CB_FAILURE_THRESHOLD,
        cbCooldownMs: config.CB_COOLDOWN_MS,
        workerConcurrency: config.WORKER_CONCURRENCY,
        cronSchedule: config.FETCH_CRON_SCHEDULE
      },
      metrics: {
        totalRequests,
        totalSuccess,
        totalFailed,
        successRate: overallSuccessRate,
        totalListingsInDb: storageStats.totalListings,
        lastRun: storageStats.lastRun
      },
      circuitBreakers: breakerStats,
      rateLimiters: rateLimitStats,
      workerPool: workerStats,
      simulatedFailures
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve pipeline status', details: err.message });
  }
});

/**
 * POST /api/fetch/trigger
 * Manually trigger an ingestion run
 */
apiRouter.post('/fetch/trigger', (req, res) => {
  try {
    const job = jobQueue.enqueue('FETCH_LISTINGS', { trigger: 'manual_api' });
    res.json({
      message: 'Ingestion job enqueued successfully',
      jobId: job.id,
      status: job.status
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger fetch job', details: err.message });
  }
});

/**
 * POST /api/simulate/failure
 * Demo/Evaluation Failure Simulation Trigger
 */
apiRouter.post('/simulate/failure', (req, res) => {
  try {
    const { source = 'RemoteOK', enable = true } = req.body;
    setSimulatedFailure(source, enable);
    
    // Automatically trigger a fetch job to demonstrate the failure & fallback immediately
    const job = jobQueue.enqueue('FETCH_LISTINGS', { trigger: 'simulated_failure_test', source });

    res.json({
      message: `Simulated failure for "${source}" set to ${enable}. Ingestion job enqueued to demonstrate resilience.`,
      source,
      simulatedFailures: getSimulatedFailures(),
      jobId: job.id
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set simulated failure', details: err.message });
  }
});

/**
 * POST /api/simulate/reset
 * Reset all simulated failures and circuit breaker states
 */
apiRouter.post('/simulate/reset', (req, res) => {
  try {
    resetSimulatedFailures();
    res.json({
      message: 'All simulated failures reset. Circuit breakers restored to CLOSED state.',
      simulatedFailures: getSimulatedFailures()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset simulations', details: err.message });
  }
});

/**
 * GET /api/logs
 * Stream or retrieve recent structured system logs
 */
apiRouter.get('/logs', (req, res) => {
  try {
    const logs = getRecentLogs();
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve logs', details: err.message });
  }
});
