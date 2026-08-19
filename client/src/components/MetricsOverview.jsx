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
    <div className="metrics-asymmetric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
      
      {/* Card 1: Token Bucket Capacity (Spans 5 Columns - Asymmetric Focus) */}
      <div id="rate-limiter-card" className="glass-panel" style={{ gridColumn: 'span 5', padding: '1.35rem', background: '#090d16', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Token-Bucket Rate Limiter</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Capped request pacing per source</div>
          </div>
          <div style={{ background: 'rgba(6, 182, 212, 0.12)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
            <Gauge size={20} color="var(--accent-primary)" />
          </div>
        </div>

        <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
          {primaryTokenInfo.tokensAvailable} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>/ {rateLimitCap} tokens</span>
        </div>

        {/* Real-time Spring Progress Bar Animation */}
        <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', height: '7px', overflow: 'hidden', marginBottom: '0.65rem' }}>
          <div
            className="spring-bar"
            style={{
              width: `${Math.min(100, primaryTokenInfo.fillPercentage)}%`,
              height: '100%',
              background: primaryTokenInfo.fillPercentage > 30 ? 'var(--accent-primary)' : 'var(--accent-amber)',
              borderRadius: '4px',
              transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          />
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
          <span>Refill: {rateLimitCap} tokens/min</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Active Refill</span>
        </div>
      </div>

      {/* Card 2: Pipeline Reliability (Spans 3 Columns) */}
      <div className="glass-panel" style={{ gridColumn: 'span 3', padding: '1.35rem', background: '#090d16', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Pipeline Reliability</div>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <CheckCircle2 size={20} color="var(--accent-emerald)" />
          </div>
        </div>

        <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
          {successRate}%
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
          <span><strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{totalRequests}</strong> calls</span>
          <span>•</span>
          <span style={{ color: 'var(--accent-rose)' }}><strong style={{ color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>{metrics?.totalFailed || 0}</strong> err</span>
        </div>
      </div>

      {/* Card 3: Deduplicated Storage (Spans 2 Columns) */}
      <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.35rem', background: '#090d16', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>SQLite Storage</div>
          <div style={{ background: 'rgba(168, 85, 247, 0.12)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
            <Database size={20} color="var(--accent-purple)" />
          </div>
        </div>

        <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
          {totalListings}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          SQLite WAL Mode
        </div>
      </div>

      {/* Card 4: Worker Engine Pool (Spans 2 Columns) */}
      <div id="worker-pool-card" className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.35rem', background: '#090d16', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>Worker Engine</div>
          <div style={{ background: 'rgba(59, 130, 246, 0.12)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
            <Layers size={20} color="var(--accent-blue)" />
          </div>
        </div>

        <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
          {workerConcurrency}
        </div>

        <div style={{ fontSize: '0.75rem', color: queuePending > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
          {queuePending > 0 ? `${queuePending} in queue` : 'Queue Idle'}
        </div>
      </div>

    </div>
  );
}
