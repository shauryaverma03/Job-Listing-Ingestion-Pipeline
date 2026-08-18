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
    <div id="circuit-breaker-section" className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      
      {/* Card Header with Demo Failure Simulation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="var(--accent-indigo)" />
            Circuit Breaker Resilience State
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Monitors consecutive failures per source. Trips open after 5 errors to prevent cascading failures.
          </p>
        </div>

        {/* Demo Resilience Simulation Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSimulatePrimaryFailure}
            disabled={isSimulating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: isSimulating ? 'not-allowed' : 'pointer'
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
              padding: '5px 12px',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: isSimulating ? 'not-allowed' : 'pointer'
            }}
          >
            <RotateCcw size={14} />
            Reset Breakers
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        
        {/* Primary Source Breaker */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: primaryBreaker.state === 'OPEN' ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-glass)',
          borderRadius: '10px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '0.05em' }}>PRIMARY SOURCE</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                RemoteOK API {simulatedFailures?.RemoteOK && <span style={{ fontSize: '0.7rem', color: '#fb7185' }}>(Simulated Error)</span>}
              </h4>
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
          border: secondaryBreaker.state === 'OPEN' ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-glass)',
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

      {/* Fallback Plan B status banner if primary is open or simulating failure */}
      {(primaryBreaker.state === 'OPEN' || simulatedFailures?.RemoteOK) && (
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
          <strong>Fallback Active:</strong> Primary feed circuit breaker is OPEN or failing. Pipeline is automatically routing requests to Secondary RSS Feed or SQLite DB Cache.
        </div>
      )}
    </div>
  );
}
