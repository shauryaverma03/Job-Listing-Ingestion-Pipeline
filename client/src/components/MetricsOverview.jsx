import React from 'react';
import { Gauge, CheckCircle2, Database, Layers } from 'lucide-react';

export function MetricsOverview({ metrics, config, rateLimiters, workerPool }) {
  const totalRequests = metrics?.totalRequests || 0;
  const successRate = metrics?.successRate ?? 100;
  const totalListings = metrics?.totalListingsInDb || 0;
  const rateLimitCap = config?.rateLimitPerMin || 10;
  
  const primaryTokenInfo = rateLimiters?.RemoteOK || { tokensAvailable: rateLimitCap, fillPercentage: 100 };
  const queuePending = workerPool?.queueStats?.pending || 0;
  const workerConcurrency = workerPool?.concurrency || 2;

  return (
    <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      
      {/* Rate Limiting Card */}
      <div id="rate-limiter-card" className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Token-Bucket Limit
          </span>
          <Gauge size={18} color="var(--accent-cyan)" />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff' }}>
          {primaryTokenInfo.tokensAvailable} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {rateLimitCap} req/min</span>
        </div>
        <div style={{ marginTop: '0.75rem', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, primaryTokenInfo.fillPercentage)}%`,
            height: '100%',
            background: primaryTokenInfo.fillPercentage > 30 ? 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))' : 'linear-gradient(90deg, var(--accent-amber), var(--accent-rose))',
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Refilling at {rateLimitCap} tokens/min per source
        </div>
      </div>

      {/* Success Rate Card */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pipeline Health
          </span>
          <CheckCircle2 size={18} color={successRate > 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff' }}>
          {successRate}% <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>success</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', gap: '8px' }}>
          <span><strong style={{ color: '#ffffff' }}>{totalRequests}</strong> total calls</span>
          <span>•</span>
          <span style={{ color: 'var(--accent-rose)' }}><strong style={{ color: 'var(--accent-rose)' }}>{metrics?.totalFailed || 0}</strong> failed</span>
        </div>
      </div>

      {/* Database Storage Card */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Deduplicated Storage
          </span>
          <Database size={18} color="var(--accent-purple)" />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff' }}>
          {totalListings} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>listings</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          SQLite persistence • Deduplicated on ID/URL
        </div>
      </div>

      {/* Worker Pool & Queue Card */}
      <div id="worker-pool-card" className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Worker Pool
          </span>
          <Layers size={18} color="var(--accent-blue)" />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff' }}>
          {workerConcurrency} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>active workers</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: queuePending > 0 ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: '0.75rem', fontWeight: 500 }}>
          {queuePending > 0 ? `${queuePending} job(s) pending in queue` : 'Queue empty • Workers idle'}
        </div>
      </div>

    </div>
  );
}
