import React from 'react';
import { Sparkles, Play, Terminal, ShieldCheck, Gauge, Cpu, Database, Activity, RefreshCw, ArrowRight } from 'lucide-react';
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
        background: '#0f172a'
      }}
    >
      {/* Top Header Bar with Live Badge & Theme Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.85rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            INGESTION ENGINE ONLINE
          </div>

          {lastUpdated && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <RefreshCw size={12} className="spin" /> Sync {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Theme Palette Switcher */}
        <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />
      </div>

      <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem', alignItems: 'center' }}>
        
        {/* Left Column: Clear Title & Controls */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            Job Feed Scraper & Resilience Pipeline
          </div>

          <h1 className="hero-title" style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: '1.25', marginBottom: '0.75rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Fault-Tolerant Job Listing Ingestion System
          </h1>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '620px' }}>
            Monitors low-risk public feeds with rate limiting, circuit breaker failovers, retry exponential backoff, and SQLite deduplication.
          </p>

          {/* Action Toolbar */}
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

        {/* Right Column: Live Pipeline Architecture Pipeline Flow Visualizer */}
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
          
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
            LIVE ARCHITECTURE INGESTION FLOW
          </div>

          <div style={{ display: 'grid', gap: '0.65rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>1. Primary Source</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>RemoteOK API</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>2. Traffic Control</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', fontFamily: 'var(--font-mono)' }}>Token Bucket (10 req/m)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>3. Resilience Guard</span>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>Circuit Breaker (5 err limit)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>4. Secondary Failover</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>WeWorkRemotely RSS</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>5. Persistence & Cache</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>SQLite WAL (ON CONFLICT)</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
