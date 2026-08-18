import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Zap } from 'lucide-react';

export function CircuitBreakerCard({ circuitBreakers }) {
  const primaryBreaker = circuitBreakers?.RemoteOK || { state: 'CLOSED', consecutiveFailures: 0, failureThreshold: 5 };
  const secondaryBreaker = circuitBreakers?.WeWorkRemotely || { state: 'CLOSED', consecutiveFailures: 0, failureThreshold: 5 };

  return (
    <div id="circuit-breaker-section" className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="var(--accent-indigo)" />
            Circuit Breaker Resilience State
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Monitors consecutive failures per source. Trips open after 5 failures to prevent cascading errors.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        
        {/* Primary Source Breaker */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: primaryBreaker.state === 'OPEN' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-glass)',
          borderRadius: '10px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '0.05em' }}>PRIMARY SOURCE</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>RemoteOK API</h4>
            </div>
            <div className={`status-pill ${primaryBreaker.state}`}>
              <span className="pulse-dot"></span>
              {primaryBreaker.state}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Consecutive Failures:</span>
              <strong style={{ color: primaryBreaker.consecutiveFailures > 0 ? '#fbbf24' : '#ffffff' }}>
                {primaryBreaker.consecutiveFailures} / {primaryBreaker.failureThreshold}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Requests Made:</span>
              <strong>{primaryBreaker.totalRequests || 0}</strong>
            </div>
            {primaryBreaker.cooldownRemainingMs > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontWeight: 600 }}>
                <span>Cooldown Remaining:</span>
                <span>{Math.ceil(primaryBreaker.cooldownRemainingMs / 1000)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Fallback Source Breaker */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: secondaryBreaker.state === 'OPEN' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-glass)',
          borderRadius: '10px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-purple)', letterSpacing: '0.05em' }}>SECONDARY FALLBACK</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>WeWorkRemotely RSS</h4>
            </div>
            <div className={`status-pill ${secondaryBreaker.state}`}>
              <span className="pulse-dot"></span>
              {secondaryBreaker.state}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Consecutive Failures:</span>
              <strong style={{ color: secondaryBreaker.consecutiveFailures > 0 ? '#fbbf24' : '#ffffff' }}>
                {secondaryBreaker.consecutiveFailures} / {secondaryBreaker.failureThreshold}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Requests Made:</span>
              <strong>{secondaryBreaker.totalRequests || 0}</strong>
            </div>
            {secondaryBreaker.cooldownRemainingMs > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontWeight: 600 }}>
                <span>Cooldown Remaining:</span>
                <span>{Math.ceil(secondaryBreaker.cooldownRemainingMs / 1000)}s</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Fallback Plan B status banner if primary is open */}
      {primaryBreaker.state === 'OPEN' && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#fbbf24',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Zap size={16} />
          <strong>Plan B Active:</strong> Primary feed circuit breaker is OPEN. System automatically routing fetch requests to Secondary RSS Feed or SQLite DB cache.
        </div>
      )}
    </div>
  );
}
