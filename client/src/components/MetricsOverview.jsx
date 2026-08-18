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
    <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
      
      {/* Rate Limiting Card */}
      <div id="rate-limiter-card" className="glass-panel" style={{ padding: '1.25rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            Token-Bucket Capacity
          </span>
          <Gauge size={18} color="var(--accent-cyan)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          {primaryTokenInfo.tokensAvailable} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {rateLimitCap} tokens</span>
        </div>
        <div style={{ marginTop: '0.75rem', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, primaryTokenInfo.fillPercentage)}%`,
            height: '100%',
            background: primaryTokenInfo.fillPercentage > 30 ? 'var(--accent-cyan)' : 'var(--accent-amber)',
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Refill: {rateLimitCap} tokens/min</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Active</span>
        </div>
      </div>

      {/* Success Rate Card */}
      <div className="glass-panel" style={{ padding: '1.25rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            Pipeline Reliability
          </span>
          <CheckCircle2 size={18} color={successRate > 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          {successRate}% <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Healthy</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', display: 'flex', gap: '8px' }}>
          <span><strong style={{ color: '#ffffff' }}>{totalRequests}</strong> calls</span>
          <span>•</span>
          <span style={{ color: 'var(--accent-rose)' }}><strong style={{ color: 'var(--accent-rose)' }}>{metrics?.totalFailed || 0}</strong> errors</span>
        </div>
      </div>

      {/* Database Storage Card */}
      <div className="glass-panel" style={{ padding: '1.25rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            Deduplicated Storage
          </span>
          <Database size={18} color="var(--accent-purple)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          {totalListings} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>records</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          SQLite WAL Mode • Unique ID Indexing
        </div>
      </div>

      {/* Worker Pool & Queue Card */}
      <div id="worker-pool-card" className="glass-panel" style={{ padding: '1.25rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            Worker Engine Pool
          </span>
          <Layers size={18} color="var(--accent-blue)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          {workerConcurrency} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>workers</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: queuePending > 0 ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: '0.75rem', fontWeight: 500 }}>
          {queuePending > 0 ? `${queuePending} task(s) pending in queue` : 'Queue Status: Idle'}
        </div>
      </div>

    </div>
  );
}
