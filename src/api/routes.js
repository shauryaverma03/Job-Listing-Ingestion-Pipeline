import express from 'express';
import { getListings, getStorageStats } from '../storage/db.js';
import { rateLimiterManager, circuitBreakerManager } from '../fetcher/fetcherService.js';
import { jobQueue, workerPool } from '../queue/jobQueue.js';
import { getRecentLogs } from '../logger/logger.js';
import { config } from '../config/env.js';

export const apiRouter = express.Router();

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
 * Pipeline health, circuit breaker states, rate limiters, storage metrics, and worker pool stats
 */
apiRouter.get('/status', (req, res) => {
  try {
    const storageStats = getStorageStats();
    const breakerStats = circuitBreakerManager.getStatus();
    const rateLimitStats = rateLimiterManager.getStatus();
    const workerStats = workerPool.getStats();

    // Aggregate total requests, success & fail counts across circuit breakers
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
      workerPool: workerStats
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
