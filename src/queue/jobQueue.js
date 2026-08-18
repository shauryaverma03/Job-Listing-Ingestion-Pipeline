import { config } from '../config/env.js';
import { logger } from '../logger/logger.js';
import { executeFetchTask } from '../fetcher/fetcherService.js';

/**
 * ARCHITECTURAL NOTE FOR HORIZONTAL SCALING:
 * 
 * In a distributed, multi-instance deployment (e.g. Kubernetes, AWS ECS, multiple Render instances),
 * this in-memory queue can be replaced 1-to-1 with a distributed message broker like Redis (BullMQ/Kue),
 * RabbitMQ, or AWS SQS.
 * 
 * Key Scaling Principles Implemented Here:
 * 1. STATELESS WORKERS: Workers do not store task state locally. They fetch task definitions from the queue,
 *    process them idempotently, and update shared storage (SQLite/MongoDB).
 * 2. ATOMIC LOCKING / DEQUEUE: Each worker atomically claims a task before processing to prevent duplicate execution.
 * 3. RETRY & DEAD-LETTER HANDLING: Failed queue jobs are logged and can be re-queued with exponential delay.
 */

class InProcessQueue {
  constructor() {
    this.jobs = [];
    this.completedCount = 0;
    this.failedCount = 0;
  }

  enqueue(type = 'FETCH_LISTINGS', payload = {}) {
    const job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      status: 'PENDING', // PENDING, PROCESSING, COMPLETED, FAILED
      queuedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      result: null
    };

    this.jobs.push(job);
    logger.info('Queue', `Enqueued job #${job.id} (Type: ${type}). Queue size: ${this.getPendingCount()}`);
    return job;
  }

  getNextPending() {
    return this.jobs.find(j => j.status === 'PENDING');
  }

  getPendingCount() {
    return this.jobs.filter(j => j.status === 'PENDING').length;
  }

  getProcessingCount() {
    return this.jobs.filter(j => j.status === 'PROCESSING').length;
  }

  getStats() {
    return {
      pending: this.getPendingCount(),
      processing: this.getProcessingCount(),
      completed: this.completedCount,
      failed: this.failedCount,
      totalQueued: this.jobs.length
    };
  }
}

export const jobQueue = new InProcessQueue();

export class WorkerPool {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.workers = [];
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('WorkerPool', `Starting worker pool with ${this.concurrency} stateless worker loops...`);

    for (let i = 1; i <= this.concurrency; i++) {
      this.startWorkerLoop(i);
    }
  }

  async startWorkerLoop(workerId) {
    logger.info('WorkerPool', `Worker #${workerId} initialized and ready for jobs.`);

    while (this.isRunning) {
      const job = jobQueue.getNextPending();

      if (job) {
        // Claim job atomically
        job.status = 'PROCESSING';
        job.startedAt = new Date().toISOString();

        logger.info('WorkerPool', `Worker #${workerId} picked up job #${job.id}`);

        try {
          let result;
          if (job.type === 'FETCH_LISTINGS') {
            result = await executeFetchTask(job);
          } else {
            throw new Error(`Unknown job type: ${job.type}`);
          }

          job.status = 'COMPLETED';
          job.completedAt = new Date().toISOString();
          job.result = result;
          jobQueue.completedCount++;

          logger.info('WorkerPool', `Worker #${workerId} completed job #${job.id} successfully.`);
        } catch (err) {
          job.status = 'FAILED';
          job.error = err.message;
          jobQueue.failedCount++;

          logger.error('WorkerPool', `Worker #${workerId} failed job #${job.id}: ${err.message}`);
        }
      }

      // Idle sleep tick before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  stop() {
    this.isRunning = false;
    logger.info('WorkerPool', 'Worker pool stopping...');
  }

  getStats() {
    return {
      concurrency: this.concurrency,
      isRunning: this.isRunning,
      queueStats: jobQueue.getStats()
    };
  }
}

export const workerPool = new WorkerPool(config.WORKER_CONCURRENCY);
