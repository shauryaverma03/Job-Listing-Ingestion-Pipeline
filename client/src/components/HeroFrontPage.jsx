import React from 'react';
import { Sparkles, Play, Terminal, ShieldCheck, Gauge, Cpu, Database, Activity, RefreshCw } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

export function HeroFrontPage({ onStartTour, onOpenTerminal, onTriggerFetch, isTriggering, currentTheme, onSelectTheme, lastUpdated }) {
  return (
    <div
      id="hero-header-section"
      className="glass-panel"
      style={{
        padding: '2rem 2.25rem',
        marginBottom: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.9) 100%)'
      }}
    >
      {/* Top Header Row with System Status Badge & Theme Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            PIPELINE STATUS: HEALTHY
          </div>

          {lastUpdated && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <RefreshCw size={12} className="spin" /> Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Theme Palette Switcher */}
        <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />
      </div>

      <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'center' }}>
        
        {/* Left Column: Hero Title & Controls */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-indigo)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
            ACDYON Technologies Engineering Challenge • Part 1
          </div>

          <h1 className="hero-title" style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: '1.25', marginBottom: '0.85rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Resilient Job Listing Ingestion Pipeline
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.65', marginBottom: '1.5rem', maxWidth: '640px' }}>
            Fault-tolerant web crawler & ingestion engine built with a <strong style={{ color: '#ffffff' }}>Token-Bucket Rate Limiter</strong>, <strong style={{ color: '#ffffff' }}>3-State Circuit Breaker</strong>, <strong style={{ color: '#ffffff' }}>Exponential Retry Backoff with Jitter</strong>, and <strong style={{ color: '#ffffff' }}>SQLite Deduplication</strong>.
          </p>

          {/* Primary Action Controls */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
            <button
              id="trigger-fetch-btn"
              onClick={onTriggerFetch}
              disabled={isTriggering}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                background: isTriggering ? 'rgba(16, 185, 129, 0.4)' : '#10b981',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: isTriggering ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              <Play size={16} fill="#ffffff" className={isTriggering ? 'spin' : ''} />
              {isTriggering ? 'Ingesting Feeds...' : 'Trigger Ingestion Run'}
            </button>

            <button
              id="logs-button-trigger"
              onClick={onOpenTerminal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                background: 'rgba(30, 41, 59, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Terminal size={16} color="var(--accent-cyan)" />
              System Pipeline Logs
            </button>

            <button
              onClick={onStartTour}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.7rem 1.2rem',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                color: '#a5b4fc',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Sparkles size={16} />
              Guided Tour
            </button>

          </div>
        </div>

        {/* Right Column: Key Architecture Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
              <Gauge size={18} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Token Bucket</h4>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Capped at 10 req/min per source with automatic token refills.</p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
              <ShieldCheck size={18} color="var(--accent-rose)" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Circuit Breaker</h4>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Trips open on 5 errors with 30s cooldown & half-open trial.</p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
              <Cpu size={18} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Stateless Workers</h4>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Concurrent worker pool designed for horizontal scaling.</p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
              <Database size={18} color="var(--accent-purple)" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Plan B Fallback</h4>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Secondary RSS feed failover + stale SQLite DB cache fallback.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
