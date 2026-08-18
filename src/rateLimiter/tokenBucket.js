import { logger } from '../logger/logger.js';

export class TokenBucket {
  constructor(capacity, refillRatePerMin) {
    this.capacity = capacity;
    this.refillRatePerMs = refillRatePerMin / 60000;
    this.tokens = capacity;
    this.lastRefillTime = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedTime = now - this.lastRefillTime;
    const tokensToAdd = elapsedTime * this.refillRatePerMs;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
  }

  tryConsume(count = 1) {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  async waitForToken(count = 1, timeoutMs = 15000) {
    const startTime = Date.now();

    while (true) {
      if (this.tryConsume(count)) {
        return true;
      }

      const neededTokens = count - this.tokens;
      const waitMs = Math.ceil(neededTokens / this.refillRatePerMs);

      if (Date.now() - startTime + waitMs > timeoutMs) {
        throw new Error(`Rate limit timeout: waited longer than ${timeoutMs}ms for ${count} token(s)`);
      }

      logger.debug('RateLimiter', `Bucket empty. Waiting ${waitMs}ms for token...`);
      await new Promise((resolve) => setTimeout(resolve, Math.max(50, waitMs)));
    }
  }

  getStatus() {
    this.refill();
    return {
      capacity: this.capacity,
      tokensAvailable: Math.floor(this.tokens * 100) / 100,
      fillPercentage: Math.round((this.tokens / this.capacity) * 100)
    };
  }
}

export class RateLimiterManager {
  constructor(defaultCapacityPerMin = 10) {
    this.defaultCapacity = defaultCapacityPerMin;
    this.buckets = new Map();
  }

  getBucket(sourceKey) {
    if (!this.buckets.has(sourceKey)) {
      this.buckets.set(sourceKey, new TokenBucket(this.defaultCapacity, this.defaultCapacity));
      logger.info('RateLimiter', `Created token bucket for source "${sourceKey}" (${this.defaultCapacity} req/min)`);
    }
    return this.buckets.get(sourceKey);
  }

  async acquireToken(sourceKey, timeoutMs = 15000) {
    const bucket = this.getBucket(sourceKey);
    return await bucket.waitForToken(1, timeoutMs);
  }

  getStatus() {
    const status = {};
    for (const [source, bucket] of this.buckets.entries()) {
      status[source] = bucket.getStatus();
    }
    return status;
  }
}
