import React, { useState } from 'react';
import { Sparkles, Play, Terminal, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

export function HeroFrontPage({ onStartTour, onOpenTerminal, onTriggerFetch, isTriggering, currentTheme, onSelectTheme, lastUpdated }) {
  const [activeStepHover, setActiveStepHover] = useState(null);
  const [liveTime, setLiveTime] = useState(() => new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="hero-header-section"
      className="glass-panel"
      style={{
        padding: '2.25rem 2.5rem',
        marginBottom: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#0c1222',
        borderRadius: '16px'
      }}
    >
      {/* Top Header Bar with Live Badge & Theme Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '9999px',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: 'var(--accent-primary)',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)' }} />
            Ingestion Engine Online
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}>
            <RefreshCw size={13} className="spin" color="var(--accent-primary)" /> Sync {liveTime.toLocaleTimeString()}
          </span>
        </div>

        {/* Theme Palette Switcher */}
        <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />
      </div>

      <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', alignItems: 'center' }}>
        
        {/* Left Column: Headline & Primary Actions */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            ACDYON Technologies Engineering Challenge • Part 1
          </div>

          <h1 className="hero-title" style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: '1.2', marginBottom: '0.85rem', color: '#ffffff', letterSpacing: '-0.03em' }}>
            Fault-Tolerant Job Listing Ingestion System
          </h1>

          <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', lineHeight: '1.65', marginBottom: '1.75rem', maxWidth: '640px' }}>
            A resilient pipeline monitoring rate-limited public job feeds, circuit breaker failovers, exponential backoff retries, and deduplicated SQLite storage.
          </p>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
            <button
              id="trigger-fetch-btn"
              onClick={onTriggerFetch}
              disabled={isTriggering}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                background: isTriggering ? 'rgba(6, 182, 212, 0.4)' : 'var(--accent-primary)',
                border: 'none',
                color: '#090d16',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: isTriggering ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px var(--accent-primary-glow)',
                transition: 'all 0.2s ease'
              }}
            >
              <Play size={16} fill="#090d16" className={isTriggering ? 'spin' : ''} />
              {isTriggering ? 'Ingesting Feeds...' : 'Trigger Ingestion Run'}
            </button>

            <button
              id="logs-button-trigger"
              onClick={onOpenTerminal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.4rem',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Terminal size={16} color="var(--accent-primary)" />
              System Pipeline Logs
            </button>

            <button
              onClick={onStartTour}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={16} />
              Guided Tour
            </button>

          </div>
        </div>

        {/* Right Column: Hand-crafted Data Flow Illustration & Interactive Pipeline Architecture */}
        <div style={{ background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Pipeline Ingestion Architecture
            </span>

            {/* Custom Vector Data Flow Line Illustration */}
            <svg width="60" height="12" viewBox="0 0 60 12" fill="none">
              <path d="M2 6H58" stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="54" cy="6" r="3" fill="var(--accent-primary)" />
            </svg>
          </div>

          {/* Interactive Pipeline Architecture Flow Steps (1-5) */}
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            
            {[
              { num: '1', title: 'Primary Feed', value: 'RemoteOK JSON API', color: 'var(--accent-cyan)' },
              { num: '2', title: 'Traffic Control', value: 'Token Bucket (10 req/m)', color: 'var(--accent-indigo)' },
              { num: '3', title: 'Resilience Guard', value: 'Circuit Breaker (5 err limit)', color: 'var(--accent-emerald)' },
              { num: '4', title: 'Secondary Failover', value: 'WeWorkRemotely RSS', color: 'var(--accent-purple)' },
              { num: '5', title: 'Storage & Cache', value: 'SQLite WAL (ON CONFLICT id)', color: 'var(--accent-amber)' }
            ].map((step, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveStepHover(idx)}
                onMouseLeave={() => setActiveStepHover(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: activeStepHover === idx ? 'rgba(6, 182, 212, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                  border: activeStepHover === idx ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: step.color, background: 'rgba(255,255,255,0.06)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
                    {step.num}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>{step.title}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: step.color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {step.value}
                </span>
              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}
