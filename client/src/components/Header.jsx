import React from 'react';
import { Activity, Play, Terminal, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';

export function Header({ onTrigger, isTriggering, onToggleLogs, lastUpdated }) {
  return (
    <header className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}>
            <Cpu size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Job Ingestion Pipeline
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', fontWeight: 600 }}>
                DEMO ARCHITECTURE
              </span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Rate-limited token bucket • 3-state circuit breaker • Retry backoff • Deduplicated SQLite
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={12} className="spin" /> Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={onToggleLogs}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              background: 'rgba(31, 41, 55, 0.8)',
              border: '1px solid var(--border-color)',
              color: '#d1d5db',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <Terminal size={16} color="#60a5fa" />
            Console Logs
          </button>

          <button
            onClick={onTrigger}
            disabled={isTriggering}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              background: isTriggering ? '#2563eb' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isTriggering ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              opacity: isTriggering ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            <Play size={16} fill="#ffffff" style={{ animation: isTriggering ? 'spin 1s linear infinite' : 'none' }} />
            {isTriggering ? 'Enqueueing Task...' : 'Trigger Fetch Run'}
          </button>
        </div>

      </div>
    </header>
  );
}
