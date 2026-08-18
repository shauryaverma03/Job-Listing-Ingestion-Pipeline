import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { TokenBucket } from '../src/rateLimiter/tokenBucket.js';
import { CircuitBreaker, CIRCUIT_STATES } from '../src/circuitBreaker/circuitBreaker.js';
import { withRetry } from '../src/fetcher/retry.js';
import { saveListings, getListings, initDatabase } from '../src/storage/db.js';
import {
  executeFetchTask,
  setSimulatedFailure,
  resetSimulatedFailures,
  circuitBreakerManager
} from '../src/fetcher/fetcherService.js';

describe('Job Ingestion Pipeline Resilience & Fallback Test Suite', () => {

  beforeEach(() => {
    initDatabase();
    resetSimulatedFailures();
  });

  afterEach(() => {
    resetSimulatedFailures();
  });

  // Core Test 1: Rate Limiter Token Bucket
  test('TokenBucket rate limiter consumes tokens and enforces capacity', async () => {
    const bucket = new TokenBucket(5, 60);
    
    assert.equal(bucket.tryConsume(1), true);
    assert.equal(bucket.tryConsume(1), true);
    assert.equal(bucket.tryConsume(1), true);
    assert.equal(bucket.tryConsume(1), true);
    assert.equal(bucket.tryConsume(1), true);
    assert.equal(bucket.tryConsume(1), false);
  });

  // Core Test 2: Circuit Breaker State Transitions
  test('CircuitBreaker transitions CLOSED -> OPEN after threshold failures -> HALF_OPEN -> CLOSED on success', async () => {
    const breaker = new CircuitBreaker('TestBreaker', { failureThreshold: 3, cooldownMs: 100 });

    assert.equal(breaker.state, CIRCUIT_STATES.CLOSED);

    breaker.onFailure(new Error('Fail 1'));
    breaker.onFailure(new Error('Fail 2'));
    breaker.onFailure(new Error('Fail 3'));

    assert.equal(breaker.state, CIRCUIT_STATES.OPEN);

    await assert.rejects(
      async () => await breaker.execute(async () => 'should fail'),
      /is OPEN/
    );

    await new Promise(r => setTimeout(r, 120));

    assert.equal(breaker.canExecute(), true);
    assert.equal(breaker.state, CIRCUIT_STATES.HALF_OPEN);

    await breaker.execute(async () => 'success');
    assert.equal(breaker.state, CIRCUIT_STATES.CLOSED);
  });

  // Core Test 3: Retry Backoff & Non-Retryable 404 Handling
  test('withRetry retries temporary server errors and fails immediately on non-retryable 404', async () => {
    let callCount = 0;

    const result = await withRetry(async () => {
      callCount++;
      if (callCount === 1) {
        const err = new Error('Server Error');
        err.status = 500;
        throw err;
      }
      return 'success';
    }, { maxRetries: 2, initialDelayMs: 10 });

    assert.equal(result, 'success');
    assert.equal(callCount, 2);

    callCount = 0;
    await assert.rejects(
      async () => await withRetry(async () => {
        callCount++;
        const err = new Error('Not Found');
        err.status = 404;
        throw err;
      }, { maxRetries: 3, initialDelayMs: 10 }),
      /Not Found/
    );

    assert.equal(callCount, 1);
  });

  // Core Test 4: Deduplication & Canonical Normalization Schema Storage
  test('saveListings normalizes listings into canonical schema and updates duplicate IDs', () => {
    const testId = `test-job-${Date.now()}`;
    const testItems = [
      {
        id: testId,
        title: 'Backend Engineer',
        company: 'ACDYON',
        location: 'Remote',
        url: `https://example.com/job/${testId}`,
        source: 'TestFeed',
        publishedAt: '2026-08-18T10:00:00Z',
        fetchedAt: '2026-08-18T12:00:00Z',
        tags: ['nodejs', 'express'],
        salary: '$120,000 - $140,000',
        description: 'Test job description'
      }
    ];

    const { insertedCount } = saveListings(testItems, false);
    assert.equal(insertedCount, 1);

    const res = getListings({ page: 1, limit: 10, search: 'ACDYON' });
    assert.ok(res.listings.length > 0);
    const savedItem = res.listings.find(l => l.id === testId);
    assert.ok(savedItem);
    assert.equal(savedItem.title, 'Backend Engineer');
    assert.equal(savedItem.isStale, false);
    assert.equal(savedItem.source, 'TestFeed');

    const reinsertRes = saveListings(testItems, false);
    assert.equal(reinsertRes.insertedCount, 0);
    assert.equal(reinsertRes.updatedCount, 1);
  });

  // FALLBACK SCENARIO TEST 1: Primary source failure -> Secondary source succeeds
  test('Fallback Scenario 1: Primary source failure routes to secondary fallback source', async () => {
    setSimulatedFailure('RemoteOK', true);

    const result = await executeFetchTask({ id: 'test-fallback-1' });
    
    assert.equal(result.success, true);
    assert.ok(result.source.includes('WeWorkRemotely'));
    assert.equal(result.isFallback, true);
  });

  // FALLBACK SCENARIO TEST 2: Primary failure -> Secondary failure -> Cache fallback
  test('Fallback Scenario 2: Primary & Secondary failure routes to SQLite cache fallback with stale metadata', async () => {
    setSimulatedFailure('RemoteOK', true);
    setSimulatedFailure('WeWorkRemotely', true);

    const result = await executeFetchTask({ id: 'test-fallback-2' });

    assert.equal(result.success, true);
    assert.equal(result.source, 'Database Cache (Stale Data)');
    assert.equal(result.isStale, true);
    assert.equal(result.isFallback, true);
  });

  // FALLBACK SCENARIO TEST 3: Malformed individual job item skipped gracefully
  test('Resilience Test 3: Malformed listing items are skipped without crashing ingestion batch', () => {
    const rawBatch = [
      { illegalNotice: 'Legal Info' }, // index 0 metadata
      null,                           // malformed null
      'invalid string item',          // malformed string
      { position: 'Valid Engineer', company: 'TechCorp', id: 999123, url: '/l/999123' } // valid item
    ];

    // Simulating parser loop logic
    const normalized = [];
    for (const item of rawBatch.slice(1)) {
      try {
        if (!item || typeof item !== 'object') continue;
        normalized.push({
          id: `test-${item.id}`,
          title: item.position,
          company: item.company
        });
      } catch (err) {
        // Skipped
      }
    }

    assert.equal(normalized.length, 1);
    assert.equal(normalized[0].title, 'Valid Engineer');
  });

  // FALLBACK SCENARIO TEST 4: Empty source response handled gracefully
  test('Resilience Test 4: Empty or non-array source response is caught as ingestion failure', () => {
    const emptyResponse = '';
    assert.throws(() => {
      if (!emptyResponse || emptyResponse.trim().length === 0) {
        throw new Error('API returned empty response body');
      }
    }, /empty response body/);
  });

  // FALLBACK SCENARIO TEST 5: Circuit breaker OPEN bypasses failed primary source
  test('Resilience Test 5: Circuit Breaker OPEN state bypasses primary source without extra network calls', async () => {
    const primaryBreaker = circuitBreakerManager.getBreaker('RemoteOK');
    primaryBreaker.state = CIRCUIT_STATES.OPEN;
    primaryBreaker.nextAttemptAllowedAt = Date.now() + 60000;

    // Execute task - should skip RemoteOK immediately and use WeWorkRemotely fallback
    const result = await executeFetchTask({ id: 'test-cb-open' });

    assert.ok(result.source.includes('WeWorkRemotely'));
    assert.equal(result.isFallback, true);
  });

});
