import { logger } from '../logger/logger.js';

export const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

export class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.cooldownMs = options.cooldownMs || 30000;
    
    this.state = CIRCUIT_STATES.CLOSED;
    this.consecutiveFailures = 0;
    this.lastStateChange = Date.now();
    this.nextAttemptAllowedAt = 0;
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
  }

  canExecute() {
    const now = Date.now();

    if (this.state === CIRCUIT_STATES.OPEN) {
      if (now >= this.nextAttemptAllowedAt) {
        this.transitionTo(CIRCUIT_STATES.HALF_OPEN, 'Cooldown elapsed; testing with next request');
        return true;
      }
      return false;
    }

    return true;
  }

  async execute(actionFn) {
    if (!this.canExecute()) {
      const waitTimeRemainingSec = Math.ceil((this.nextAttemptAllowedAt - Date.now()) / 1000);
      logger.warn('CircuitBreaker', `[${this.name}] Breaker is OPEN. Short-circuiting call. Cooldown remaining: ${waitTimeRemainingSec}s`);
      throw new Error(`CircuitBreaker '${this.name}' is OPEN. Request blocked.`);
    }

    this.totalRequests++;

    try {
      const result = await actionFn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      throw err;
    }
  }

  onSuccess() {
    this.successfulRequests++;

    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.transitionTo(CIRCUIT_STATES.CLOSED, 'Trial request succeeded in HALF_OPEN state');
      this.consecutiveFailures = 0;
    } else if (this.state === CIRCUIT_STATES.CLOSED) {
      this.consecutiveFailures = 0;
    }
  }

  onFailure(err) {
    this.failedRequests++;
    this.consecutiveFailures++;

    logger.warn('CircuitBreaker', `[${this.name}] Request failed (${this.consecutiveFailures}/${this.failureThreshold}): ${err.message}`);

    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.transitionTo(CIRCUIT_STATES.OPEN, 'Trial request failed in HALF_OPEN state');
      this.nextAttemptAllowedAt = Date.now() + this.cooldownMs;
    } else if (this.state === CIRCUIT_STATES.CLOSED && this.consecutiveFailures >= this.failureThreshold) {
      this.nextAttemptAllowedAt = Date.now() + this.cooldownMs;
      this.transitionTo(CIRCUIT_STATES.OPEN, `Reached failure threshold of ${this.failureThreshold} consecutive errors`);
    }
  }

  transitionTo(newState, reason) {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = Date.now();
    logger.warn('CircuitBreaker', `[${this.name}] State transition: ${oldState} -> ${newState}. Reason: ${reason}`);
  }

  getStatus() {
    const now = Date.now();
    let effectiveState = this.state;
    if (this.state === CIRCUIT_STATES.OPEN && now >= this.nextAttemptAllowedAt) {
      effectiveState = CIRCUIT_STATES.HALF_OPEN;
    }

    return {
      name: this.name,
      state: effectiveState,
      consecutiveFailures: this.consecutiveFailures,
      failureThreshold: this.failureThreshold,
      cooldownMs: this.cooldownMs,
      cooldownRemainingMs: effectiveState === CIRCUIT_STATES.OPEN ? Math.max(0, this.nextAttemptAllowedAt - now) : 0,
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      successRate: this.totalRequests > 0 ? Math.round((this.successfulRequests / this.totalRequests) * 100) : 100
    };
  }
}

export class CircuitBreakerManager {
  constructor(defaultThreshold = 5, defaultCooldownMs = 30000) {
    this.defaultThreshold = defaultThreshold;
    this.defaultCooldownMs = defaultCooldownMs;
    this.breakers = new Map();
  }

  getBreaker(name) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, {
        failureThreshold: this.defaultThreshold,
        cooldownMs: this.defaultCooldownMs
      }));
    }
    return this.breakers.get(name);
  }

  getStatus() {
    const status = {};
    for (const [name, breaker] of this.breakers.entries()) {
      status[name] = breaker.getStatus();
    }
    return status;
  }
}
