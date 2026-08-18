import React, { useState } from 'react';
import { ShieldAlert, Zap, AlertTriangle, RotateCcw, Flame } from 'lucide-react';

export function CircuitBreakerCard({ circuitBreakers, simulatedFailures, onRefresh }) {
  const [isSimulating, setIsSimulating] = useState(false);

  const primaryBreaker = circuitBreakers?.RemoteOK || { state: 'CLOSED', consecutiveFailures: 0, failureThreshold: 5 };
  const secondaryBreaker = circuitBreakers?.WeWorkRemotely || { state: 'CLOSED', consecutiveFailures: 0, failureThreshold: 5 };

  const handleSimulatePrimaryFailure = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/simulate/failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'RemoteOK', enable: true })
      });
      setTimeout(() => {
        if (onRefresh) onRefresh();
        setIsSimulating(false);
      }, 2200);
    } catch (err) {
      console.error(err);
      setIsSimulating(false);
    }
  };

  const handleResetSimulations = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/simulate/reset', { method: 'POST' });
      setTimeout(() => {
        if (onRefresh) onRefresh();
        setIsSimulating(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsSimulating(false);
    }
  };

  return (
    <div id="circuit-breaker-section" className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.75rem', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.85rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="var(--accent-indigo)" />
            3-State Circuit Breaker Control Panel
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Protects downstream services by short-circuiting calls after 5 consecutive failures (30s cooldown).
          </p>
        </div>

        {/* Failure Simulation Demo Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSimulatePrimaryFailure}
            disabled={isSimulating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Flame size={14} />
            Simulate Primary Failure
          </button>

          <button
            onClick={handleResetSimulations}
            disabled={isSimulating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={14} />
            Reset Breakers
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Primary Source Breaker */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: primaryBreaker.state === 'OPEN' ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '1.1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                PRIMARY FEED SOURCE
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                RemoteOK JSON API {simulatedFailures?.RemoteOK && <span style={{ fontSize: '0.72rem', color: '#fb7185' }}>(Simulated Error)</span>}
              </h4>
            </div>
            <div className={`status-pill ${primaryBreaker.state}`}>
              <span className="pulse-dot"></span>
              {primaryBreaker.state}
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'grid', gap: '8px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Consecutive Errors:</span>
              <strong style={{ color: primaryBreaker.consecutiveFailures > 0 ? '#fbbf24' : '#ffffff' }}>
                {primaryBreaker.consecutiveFailures} / {primaryBreaker.failureThreshold}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Ingestion Calls:</span>
              <strong style={{ color: '#ffffff' }}>{primaryBreaker.totalRequests || 0}</strong>
            </div>
            {primaryBreaker.cooldownRemainingMs > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontWeight: 700 }}>
                <span>Cooldown Remaining:</span>
                <span>{Math.ceil(primaryBreaker.cooldownRemainingMs / 1000)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Fallback Source Breaker */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: secondaryBreaker.state === 'OPEN' ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '1.1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-purple)', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                SECONDARY FALLBACK FEED
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>WeWorkRemotely RSS</h4>
            </div>
            <div className={`status-pill ${secondaryBreaker.state}`}>
              <span className="pulse-dot"></span>
              {secondaryBreaker.state}
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'grid', gap: '8px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Consecutive Errors:</span>
              <strong style={{ color: secondaryBreaker.consecutiveFailures > 0 ? '#fbbf24' : '#ffffff' }}>
                {secondaryBreaker.consecutiveFailures} / {secondaryBreaker.failureThreshold}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Ingestion Calls:</span>
              <strong style={{ color: '#ffffff' }}>{secondaryBreaker.totalRequests || 0}</strong>
            </div>
            {secondaryBreaker.cooldownRemainingMs > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontWeight: 700 }}>
                <span>Cooldown Remaining:</span>
                <span>{Math.ceil(secondaryBreaker.cooldownRemainingMs / 1000)}s</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Active Fallback Notice Banner */}
      {(primaryBreaker.state === 'OPEN' || simulatedFailures?.RemoteOK) && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#fbbf24',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Zap size={16} />
          <strong>Plan B Fallback Activated:</strong> Primary feed circuit breaker is OPEN or simulated. Ingestion pipeline is automatically routing tasks to Secondary RSS Feed (`WeWorkRemotely`) or SQLite Cache.
        </div>
      )}
    </div>
  );
}
