import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { TokenBucket } from '../src/rateLimiter/tokenBucket.js';
import { CircuitBreaker, CIRCUIT_STATES } from '../src/circuitBreaker/circuitBreaker.js';
import { withRetry } from '../src/fetcher/retry.js';
import { saveListings, getListings, initDatabase } from '../src/storage/db.js';

describe('Job Ingestion Pipeline Test Suite', () => {

  beforeEach(() => {
    initDatabase();
  });

  // Test 1: Rate Limiter Token Bucket
  test('TokenBucket rate limiter consumes tokens and enforces capacity', async () => {
    const bucket = new TokenBucket(5, 60); // 5 capacity, 60 per min (1 per sec)
    
    assert.equal(bucket.tryConsume(1), true);
    assert.equal(bucket.tryConsume(1), true);
    assert.equal(bucket.tryConsume(1), true);
    assert.equal(bucket.tryConsume(1), true);
    assert.equal(bucket.tryConsume(1), true);
    
    // 6th request should fail immediately when empty
    assert.equal(bucket.tryConsume(1), false);
  });

  // Test 2: Circuit Breaker State Transitions
  test('CircuitBreaker transitions CLOSED -> OPEN after threshold failures -> HALF_OPEN -> CLOSED on success', async () => {
    const breaker = new CircuitBreaker('TestBreaker', { failureThreshold: 3, cooldownMs: 100 });

    assert.equal(breaker.state, CIRCUIT_STATES.CLOSED);

    // Record 3 failures to trip breaker
    breaker.onFailure(new Error('Fail 1'));
    breaker.onFailure(new Error('Fail 2'));
    breaker.onFailure(new Error('Fail 3'));

    assert.equal(breaker.state, CIRCUIT_STATES.OPEN);

    // Request in OPEN state should throw error
    await assert.rejects(
      async () => await breaker.execute(async () => 'should fail'),
      /is OPEN/
    );

    // Wait for cooldown
    await new Promise(r => setTimeout(r, 120));

    // canExecute should move state to HALF_OPEN
    assert.equal(breaker.canExecute(), true);
    assert.equal(breaker.state, CIRCUIT_STATES.HALF_OPEN);

    // Trial request succeeds -> moves back to CLOSED
    await breaker.execute(async () => 'success');
    assert.equal(breaker.state, CIRCUIT_STATES.CLOSED);
  });

  // Test 3: Retry Backoff & Non-Retryable Error Handling
  test('withRetry retries temporary server errors and fails immediately on non-retryable 404', async () => {
    let callCount = 0;

    // Retryable 500 error succeeded on attempt 2
    const result = await withRetry(async (attempt) => {
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

    // Non-retryable 404 error should fail on attempt 1
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

  // Test 4: Deduplication & Canonical Normalization Schema Storage
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

    // Query back from DB
    const res = getListings({ page: 1, limit: 10, search: 'ACDYON' });
    assert.ok(res.listings.length > 0);
    const savedItem = res.listings.find(l => l.id === testId);
    assert.ok(savedItem);
    assert.equal(savedItem.title, 'Backend Engineer');
    assert.equal(savedItem.isStale, false);
    assert.equal(savedItem.source, 'TestFeed');

    // Re-inserting same ID should update instead of insert duplicate
    const reinsertRes = saveListings(testItems, false);
    assert.equal(reinsertRes.insertedCount, 0);
    assert.equal(reinsertRes.updatedCount, 1);
  });

});
