import { logger } from '../../logger/logger.js';

export async function fetchRemoteOK(sourceUrl) {
  logger.info('Fetcher', `Fetching primary source RemoteOK from ${sourceUrl}...`);

  const response = await fetch(sourceUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    const error = new Error(`RemoteOK HTTP error ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('RemoteOK API returned invalid response format (expected Array)');
  }

  // First item in RemoteOK JSON is metadata/legal disclosure
  const rawListings = data.slice(1);

  const normalized = rawListings.map(item => {
    const itemId = item.id ? String(item.id) : `${item.company}-${item.position}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return {
      id: `remoteok-${itemId}`,
      title: item.position || 'Remote Role',
      company: item.company || 'Unknown',
      location: item.location || 'Remote',
      url: item.url ? (item.url.startsWith('http') ? item.url : `https://remoteok.com${item.url}`) : 'https://remoteok.com',
      source: 'RemoteOK',
      fetchedAt: new Date().toISOString(),
      tags: Array.isArray(item.tags) ? item.tags : [],
      salary: item.salary_min || item.salary_max ? `$${item.salary_min || 0} - $${item.salary_max || 0}` : '',
      description: item.description ? item.description.substring(0, 500) : ''
    };
  });

  logger.info('Fetcher', `Successfully normalized ${normalized.length} listings from RemoteOK`);
  return normalized;
}
