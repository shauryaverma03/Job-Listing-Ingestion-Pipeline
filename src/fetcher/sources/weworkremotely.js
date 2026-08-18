import Parser from 'rss-parser';
import crypto from 'crypto';
import { logger } from '../../logger/logger.js';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  timeout: 10000
});

export async function fetchWeWorkRemotely(sourceUrl) {
  logger.info('Fetcher', `Fetching secondary fallback source WeWorkRemotely from ${sourceUrl}...`);

  let feed;
  try {
    feed = await parser.parseURL(sourceUrl);
  } catch (err) {
    const error = new Error(`WeWorkRemotely RSS parse error: ${err.message}`);
    error.status = 500;
    throw error;
  }

  if (!feed || !feed.items || !Array.isArray(feed.items)) {
    throw new Error('WeWorkRemotely RSS feed returned empty or invalid data structure');
  }

  const normalized = [];

  for (const item of feed.items) {
    try {
      if (!item || typeof item !== 'object') continue;

      let company = 'WeWorkRemotely Listing';
      let title = item.title || 'Remote Role';

      if (item.title && item.title.includes(':')) {
        const parts = item.title.split(':');
        company = parts[0].trim();
        title = parts.slice(1).join(':').trim();
      }

      // Deterministic ID hash based on link or guid
      const uniqueHash = crypto.createHash('md5').update(item.guid || item.link || item.title || 'wwr').digest('hex').substring(0, 12);

      normalized.push({
        id: `wwr-${uniqueHash}`,
        title,
        company,
        location: 'Remote',
        url: item.link || sourceUrl,
        source: 'WeWorkRemotely',
        publishedAt: item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate).toISOString() : new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        tags: item.categories || ['Remote', 'Tech'],
        salary: '',
        description: item.contentSnippet ? item.contentSnippet.substring(0, 800) : (item.content ? item.content.substring(0, 800) : ''),
        isStale: false
      });
    } catch (itemErr) {
      logger.warn('Fetcher', `Skipping malformed WeWorkRemotely RSS item: ${itemErr.message}`);
    }
  }

  logger.info('Fetcher', `Successfully normalized ${normalized.length} listings from WeWorkRemotely`);
  return normalized;
}
