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

      // Check if error is retryable (HTTP 429 rate limit, 5xx server errors, timeouts, network failures)
      // Permanent 4xx errors (400, 401, 403, 404) are non-retryable and should fail immediately.
      const status = err.status || err.response?.status;
      const isRetryableStatus = !status || status >= 500 || status === 429;
      const isNetworkError = err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.name === 'TimeoutError' || err.message.includes('fetch failed');

      const isRetryable = isRetryableStatus || isNetworkError;

      if (attempt > maxRetries || !isRetryable) {
        logger.error('Retry', `[${sourceName}] Stopping retries after attempt ${attempt-1}: ${!isRetryable ? 'Non-retryable HTTP client error' : 'Exhausted MAX_RETRIES'} (${err.message})`);
        throw err;
      }

      // Exponential backoff with random jitter
      const exponentialDelay = initialDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 400;
      const totalDelayMs = Math.min(maxDelayMs, Math.round(exponentialDelay + jitter));

      logger.warn('Retry', `[${sourceName}] Attempt ${attempt} failed: ${err.message}. Retrying in ${totalDelayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, totalDelayMs));
    }
  }
}
