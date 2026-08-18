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

  if (!feed || !feed.items) {
    throw new Error('WeWorkRemotely RSS feed returned empty or invalid data');
  }

  const normalized = feed.items.map(item => {
    // WeWorkRemotely title is often formatted as: "Company Name: Position Title (Location/Type)"
    let company = 'WeWorkRemotely Listing';
    let title = item.title || 'Remote Job';

    if (item.title && item.title.includes(':')) {
      const parts = item.title.split(':');
      company = parts[0].trim();
      title = parts.slice(1).join(':').trim();
    }

    const uniqueHash = crypto.createHash('md5').update(item.guid || item.link || item.title).digest('hex').substring(0, 12);

    return {
      id: `wwr-${uniqueHash}`,
      title,
      company,
      location: 'Remote',
      url: item.link || sourceUrl,
      source: 'WeWorkRemotely',
      fetchedAt: new Date().toISOString(),
      tags: item.categories || ['Remote', 'Tech'],
      salary: '',
      description: item.contentSnippet ? item.contentSnippet.substring(0, 500) : (item.content ? item.content.substring(0, 500) : '')
    };
  });

  logger.info('Fetcher', `Successfully normalized ${normalized.length} listings from WeWorkRemotely`);
  return normalized;
}
