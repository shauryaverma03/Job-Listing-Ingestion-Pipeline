import Database from 'better-sqlite3';
import { config } from '../config/env.js';
import { logger } from '../logger/logger.js';

let db;

export function initDatabase() {
  if (db) return db;
  
  try {
    db = new Database(config.DB_PATH);
    db.pragma('journal_mode = WAL');
    
    // Create listings table with canonical schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        url TEXT NOT NULL,
        source TEXT NOT NULL,
        published_at TEXT,
        fetched_at TEXT NOT NULL,
        tags TEXT,
        salary TEXT,
        description TEXT,
        is_stale INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_listings_source ON listings(source);
      CREATE INDEX IF NOT EXISTS idx_listings_fetched_at ON listings(fetched_at);

      CREATE TABLE IF NOT EXISTS fetch_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        status TEXT NOT NULL,
        items_count INTEGER DEFAULT 0,
        items_new INTEGER DEFAULT 0,
        error_message TEXT,
        duration_ms INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration helper for existing local DB files
    try {
      db.exec('ALTER TABLE listings ADD COLUMN published_at TEXT;');
    } catch {
      // Column already exists
    }

    logger.info('Storage', `Database initialized at ${config.DB_PATH}`);
    return db;
  } catch (err) {
    logger.error('Storage', 'Failed to initialize database', { error: err.message });
    throw err;
  }
}

export function saveListings(listings, isStale = false) {
  const database = initDatabase();
  let insertedCount = 0;
  let updatedCount = 0;

  const insertOrUpdateStmt = database.prepare(`
    INSERT INTO listings (id, title, company, location, url, source, published_at, fetched_at, tags, salary, description, is_stale, updated_at)
    VALUES (@id, @title, @company, @location, @url, @source, @publishedAt, @fetchedAt, @tags, @salary, @description, @isStale, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      company = excluded.company,
      location = excluded.location,
      url = excluded.url,
      published_at = excluded.published_at,
      fetched_at = excluded.fetched_at,
      tags = excluded.tags,
      salary = excluded.salary,
      description = excluded.description,
      is_stale = excluded.is_stale,
      updated_at = CURRENT_TIMESTAMP
  `);

  const transaction = database.transaction((items) => {
    for (const item of items) {
      const tagsStr = Array.isArray(item.tags) ? JSON.stringify(item.tags) : (item.tags || '');
      const existing = database.prepare('SELECT id FROM listings WHERE id = ?').get(item.id);
      
      insertOrUpdateStmt.run({
        id: item.id,
        title: item.title || 'Untitled Role',
        company: item.company || 'Unknown Company',
        location: item.location || 'Remote',
        url: item.url || '#',
        source: item.source || 'Unknown',
        publishedAt: item.publishedAt || item.fetchedAt || new Date().toISOString(),
        fetchedAt: item.fetchedAt || new Date().toISOString(),
        tags: tagsStr,
        salary: item.salary || '',
        description: item.description || '',
        isStale: isStale ? 1 : 0
      });

      if (existing) {
        updatedCount++;
      } else {
        insertedCount++;
      }
    }
  });

  transaction(listings);
  logger.info('Storage', `Saved ${listings.length} listings to database`, {
    inserted: insertedCount,
    updated: updatedCount,
    isStale
  });

  return { insertedCount, updatedCount, totalSaved: listings.length };
}

export function getListings({ page = 1, limit = 12, search = '', source = '' }) {
  const database = initDatabase();
  const offset = (page - 1) * limit;
  
  let whereClauses = [];
  let params = {};

  if (search) {
    whereClauses.push('(title LIKE @search OR company LIKE @search OR location LIKE @search OR tags LIKE @search)');
    params.search = `%${search}%`;
  }

  if (source) {
    whereClauses.push('source = @source');
    params.source = source;
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const totalStmt = database.prepare(`SELECT COUNT(*) as count FROM listings ${whereSql}`);
  const total = totalStmt.get(params).count;

  const listingsStmt = database.prepare(`
    SELECT id, title, company, location, url, source, published_at as publishedAt, fetched_at as fetchedAt, tags, salary, description, is_stale as isStale, created_at as createdAt
    FROM listings
    ${whereSql}
    ORDER BY fetched_at DESC
    LIMIT @limit OFFSET @offset
  `);

  const rawListings = listingsStmt.all({ ...params, limit, offset });

  const listings = rawListings.map(row => ({
    ...row,
    isStale: Boolean(row.isStale),
    tags: row.tags ? (row.tags.startsWith('[') ? JSON.parse(row.tags) : row.tags.split(',')) : []
  }));

  return {
    listings,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

export function recordFetchRun({ source, status, itemsCount = 0, itemsNew = 0, errorMessage = null, durationMs = 0 }) {
  const database = initDatabase();
  const stmt = database.prepare(`
    INSERT INTO fetch_runs (source, status, items_count, items_new, error_message, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(source, status, itemsCount, itemsNew, errorMessage, durationMs);
}

export function getLatestListings(limit = 100) {
  const database = initDatabase();
  const stmt = database.prepare(`
    SELECT id, title, company, location, url, source, published_at as publishedAt, fetched_at as fetchedAt, tags, salary, description, is_stale as isStale
    FROM listings
    ORDER BY fetched_at DESC
    LIMIT ?
  `);
  const rows = stmt.all(limit);
  return rows.map(r => ({
    ...r,
    isStale: true,
    tags: r.tags ? (r.tags.startsWith('[') ? JSON.parse(r.tags) : r.tags.split(',')) : []
  }));
}

export function getStorageStats() {
  const database = initDatabase();
  const totalListings = database.prepare('SELECT COUNT(*) as count FROM listings').get().count;
  const lastFetch = database.prepare('SELECT created_at, source, status FROM fetch_runs ORDER BY id DESC LIMIT 1').get();
  return {
    totalListings,
    lastRun: lastFetch || null
  };
}
