import { config } from '../config/env.js';
import { logger } from '../logger/logger.js';

export async function withRetry(fn, options = {}) {
  const maxRetries = options.maxRetries ?? config.MAX_RETRIES;
  const initialDelayMs = options.initialDelayMs ?? config.INITIAL_RETRY_DELAY_MS;
  const maxDelayMs = options.maxDelayMs ?? config.MAX_RETRY_DELAY_MS;
  const sourceName = options.sourceName || 'UnknownSource';

  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      if (attempt > 0) {
        logger.info('Retry', `[${sourceName}] Retry attempt ${attempt}/${maxRetries}...`);
      }
      return await fn(attempt);
    } catch (err) {
      attempt++;

      // Check if error is retryable (timeout, 5xx, 429, fetch/network error)
      const isNetworkOrServerError = !err.status || err.status >= 500 || err.status === 429 || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT';

      if (attempt > maxRetries || !isNetworkOrServerError) {
        logger.error('Retry', `[${sourceName}] Exhausted all ${maxRetries} retry attempts or non-retryable error: ${err.message}`);
        throw err;
      }

      // Calculate exponential backoff with random jitter
      const exponentialDelay = initialDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 500;
      const totalDelayMs = Math.min(maxDelayMs, Math.round(exponentialDelay + jitter));

      logger.warn('Retry', `[${sourceName}] Attempt ${attempt} failed: ${err.message}. Retrying in ${totalDelayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, totalDelayMs));
    }
  }
}
