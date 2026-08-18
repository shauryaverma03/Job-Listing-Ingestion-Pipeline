import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Rate Limiting
  RATE_LIMIT_PER_MIN: parseInt(process.env.RATE_LIMIT_PER_MIN || '10', 10),
  
  // Retry & Exponential Backoff
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3', 10),
  INITIAL_RETRY_DELAY_MS: parseInt(process.env.INITIAL_RETRY_DELAY_MS || '1000', 10),
  MAX_RETRY_DELAY_MS: parseInt(process.env.MAX_RETRY_DELAY_MS || '10000', 10),
  
  // Circuit Breaker
  CB_FAILURE_THRESHOLD: parseInt(process.env.CB_FAILURE_THRESHOLD || '5', 10),
  CB_COOLDOWN_MS: parseInt(process.env.CB_COOLDOWN_MS || '30000', 10),
  
  // Queue & Worker Pool
  WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || '2', 10),
  
  // Cron Schedule (default every 5 minutes)
  FETCH_CRON_SCHEDULE: process.env.FETCH_CRON_SCHEDULE || '*/5 * * * *',
  
  // Primary & Secondary Feed URLs
  PRIMARY_SOURCE_URL: process.env.PRIMARY_SOURCE_URL || 'https://remoteok.com/api',
  SECONDARY_SOURCE_URL: process.env.SECONDARY_SOURCE_URL || 'https://weworkremotely.com/remote-jobs.rss',
  
  // DB
  DB_PATH: process.env.DB_PATH || './pipeline.db'
};
