const MAX_LOG_BUFFER = 200;
const logBuffer = [];

export function getRecentLogs() {
  return [...logBuffer];
}

function formatMessage(level, component, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
  const logEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp,
    level,
    component,
    message,
    meta
  };

  logBuffer.push(logEntry);
  if (logBuffer.length > MAX_LOG_BUFFER) {
    logBuffer.shift();
  }

  const logLine = `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}${metaStr}`;
  return { logEntry, logLine };
}

export const logger = {
  info: (component, message, meta) => {
    const { logLine } = formatMessage('info', component, message, meta);
    console.log(`\x1b[36m${logLine}\x1b[0m`);
  },
  warn: (component, message, meta) => {
    const { logLine } = formatMessage('warn', component, message, meta);
    console.warn(`\x1b[33m${logLine}\x1b[0m`);
  },
  error: (component, message, meta) => {
    const { logLine } = formatMessage('error', component, message, meta);
    console.error(`\x1b[31m${logLine}\x1b[0m`);
  },
  debug: (component, message, meta) => {
    const { logLine } = formatMessage('debug', component, message, meta);
    console.debug(`\x1b[90m${logLine}\x1b[0m`);
  }
};
