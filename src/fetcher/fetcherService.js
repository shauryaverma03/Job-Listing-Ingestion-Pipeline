import { config } from '../config/env.js';
import { logger } from '../logger/logger.js';
import { RateLimiterManager } from '../rateLimiter/tokenBucket.js';
import { CircuitBreakerManager } from '../circuitBreaker/circuitBreaker.js';
import { withRetry } from './retry.js';
import { fetchRemoteOK } from './sources/remoteok.js';
import { fetchWeWorkRemotely } from './sources/weworkremotely.js';
import { saveListings, getLatestListings, recordFetchRun } from '../storage/db.js';

export const rateLimiterManager = new RateLimiterManager(config.RATE_LIMIT_PER_MIN);
export const circuitBreakerManager = new CircuitBreakerManager(config.CB_FAILURE_THRESHOLD, config.CB_COOLDOWN_MS);

// Failure Simulation State (for demonstration/evaluation testing)
const simulatedFailures = {
  RemoteOK: false,
  WeWorkRemotely: false
};

export function setSimulatedFailure(sourceName, isFailing = true) {
  simulatedFailures[sourceName] = Boolean(isFailing);
  logger.warn('Simulation', `Simulated failure for source "${sourceName}" set to: ${isFailing}`);
}

export function getSimulatedFailures() {
  return { ...simulatedFailures };
}

export function resetSimulatedFailures() {
  simulatedFailures.RemoteOK = false;
  simulatedFailures.WeWorkRemotely = false;
  
  // Also reset circuit breakers to CLOSED state
  for (const name of ['RemoteOK', 'WeWorkRemotely']) {
    const breaker = circuitBreakerManager.getBreaker(name);
    breaker.state = 'CLOSED';
    breaker.consecutiveFailures = 0;
    breaker.nextAttemptAllowedAt = 0;
  }

  logger.info('Simulation', 'Reset all simulated failures and circuit breaker states to CLOSED');
}

export async function executeFetchTask(jobData = {}) {
  const startTime = Date.now();
  const primaryKey = 'RemoteOK';
  const secondaryKey = 'WeWorkRemotely';

  const primaryBreaker = circuitBreakerManager.getBreaker(primaryKey);
  const secondaryBreaker = circuitBreakerManager.getBreaker(secondaryKey);

  logger.info('FetcherService', `Starting ingestion run for task #${jobData.id || 'manual'}...`);

  // --- Step 1: Attempt Primary Source (RemoteOK) ---
  if (primaryBreaker.canExecute()) {
    try {
      logger.info('FetcherService', `Attempting Primary Source (${primaryKey})...`);
      
      // Acquire token from rate limiter
      await rateLimiterManager.acquireToken(primaryKey);

      // Execute with circuit breaker & retry
      const listings = await primaryBreaker.execute(async () => {
        if (simulatedFailures[primaryKey]) {
          const err = new Error(`[Simulated Failure Mode] Primary source ${primaryKey} is returning simulated HTTP 503 error.`);
          err.status = 503;
          throw err;
        }

        return await withRetry(() => fetchRemoteOK(config.PRIMARY_SOURCE_URL), {
          sourceName: primaryKey,
          maxRetries: config.MAX_RETRIES
        });
      });

      const { insertedCount, updatedCount } = saveListings(listings, false);
      const durationMs = Date.now() - startTime;

      recordFetchRun({
        source: primaryKey,
        status: 'SUCCESS',
        itemsCount: listings.length,
        itemsNew: insertedCount,
        durationMs
      });

      logger.info('FetcherService', `Primary fetch (${primaryKey}) succeeded in ${durationMs}ms. (${insertedCount} new, ${updatedCount} updated)`);
      
      return {
        success: true,
        source: primaryKey,
        isStale: false,
        count: listings.length,
        newItems: insertedCount,
        durationMs
      };
    } catch (err) {
      logger.warn('FetcherService', `Primary source (${primaryKey}) failed: ${err.message}. Initiating Fallback Plan B...`);
      recordFetchRun({
        source: primaryKey,
        status: 'FAILED',
        errorMessage: err.message,
        durationMs: Date.now() - startTime
      });
    }
  } else {
    logger.warn('FetcherService', `Primary source (${primaryKey}) Circuit Breaker is OPEN. Bypassing primary source.`);
  }

  // --- Step 2: Fallback to Secondary Source (WeWorkRemotely RSS) ---
  if (secondaryBreaker.canExecute()) {
    try {
      logger.info('FetcherService', `Attempting Secondary Fallback Source (${secondaryKey})...`);
      
      await rateLimiterManager.acquireToken(secondaryKey);

      const listings = await secondaryBreaker.execute(async () => {
        if (simulatedFailures[secondaryKey]) {
          const err = new Error(`[Simulated Failure Mode] Secondary source ${secondaryKey} is returning simulated HTTP 500 error.`);
          err.status = 500;
          throw err;
        }

        return await withRetry(() => fetchWeWorkRemotely(config.SECONDARY_SOURCE_URL), {
          sourceName: secondaryKey,
          maxRetries: config.MAX_RETRIES
        });
      });

      const { insertedCount, updatedCount } = saveListings(listings, false);
      const durationMs = Date.now() - startTime;

      recordFetchRun({
        source: secondaryKey,
        status: 'FALLBACK_SUCCESS',
        itemsCount: listings.length,
        itemsNew: insertedCount,
        durationMs
      });

      logger.info('FetcherService', `Secondary fallback fetch (${secondaryKey}) succeeded in ${durationMs}ms.`);

      return {
        success: true,
        source: `${secondaryKey} (Fallback)`,
        isStale: false,
        count: listings.length,
        newItems: insertedCount,
        durationMs,
        isFallback: true
      };
    } catch (err) {
      logger.error('FetcherService', `Secondary fallback source (${secondaryKey}) failed: ${err.message}`);
      recordFetchRun({
        source: secondaryKey,
        status: 'FAILED',
        errorMessage: err.message,
        durationMs: Date.now() - startTime
      });
    }
  } else {
    logger.warn('FetcherService', `Secondary source (${secondaryKey}) Circuit Breaker is OPEN.`);
  }

  // --- Step 3: Plan B - Serve Last-Known-Good Cached Data ---
  logger.warn('FetcherService', 'All live feeds unavailable or circuit breakers tripped! Falling back to last-known-good cached data in database.');

  const cachedListings = getLatestListings(100);
  const durationMs = Date.now() - startTime;

  recordFetchRun({
    source: 'Storage Cache (Plan B)',
    status: 'CACHE_FALLBACK',
    itemsCount: cachedListings.length,
    durationMs
  });

  return {
    success: true,
    source: 'Database Cache (Stale Data)',
    isStale: true,
    count: cachedListings.length,
    newItems: 0,
    durationMs,
    isFallback: true
  };
}
