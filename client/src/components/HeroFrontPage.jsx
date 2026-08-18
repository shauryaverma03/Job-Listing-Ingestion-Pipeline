import React from 'react';
import { Sparkles, Play, Terminal, ShieldCheck, Gauge, Cpu, Database, Zap } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

export function HeroFrontPage({ onStartTour, onOpenTerminal, onTriggerFetch, isTriggering, currentTheme, onSelectTheme }) {
  return (
    <div
      id="hero-header-section"
      className="glass-panel"
      style={{
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.6) 100%)'
      }}
    >
      {/* Background Subtle Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top Header Row with Theme Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          <Zap size={14} color="var(--accent-indigo)" />
          RESILIENT PIPELINE DEMO ARCHITECTURE
        </div>

        {/* Theme Palette Switcher */}
        <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />
      </div>

      <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'center' }}>
        
        {/* Left Column: Hero Text & Call to Actions */}
        <div>
          <h1 className="hero-title gradient-text" style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: '1.2', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Rate-Limited Scraper & Fault-Tolerant Ingestion Pipeline
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.75rem', maxWidth: '620px' }}>
            Built for extreme reliability: implements a custom <strong style={{ color: 'var(--accent-cyan)' }}>Token-Bucket Rate Limiter</strong>, <strong style={{ color: 'var(--accent-rose)' }}>3-State Circuit Breaker</strong>, <strong style={{ color: 'var(--accent-emerald)' }}>Exponential Backoff with Jitter</strong>, and <strong style={{ color: 'var(--accent-purple)' }}>Stateless Worker Pool</strong> with SQLite deduplication.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
            <button
              onClick={onStartTour}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-indigo) 0%, #4f46e5 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              <Sparkles size={18} />
              Interactive Guided Tour
            </button>

            <button
              id="logs-button-trigger"
              onClick={onOpenTerminal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Terminal size={18} color="var(--accent-cyan)" />
              System Pipeline Logs
            </button>

            <button
              id="trigger-fetch-btn"
              onClick={onTriggerFetch}
              disabled={isTriggering}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                background: isTriggering ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isTriggering ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Play size={18} className={isTriggering ? 'spin' : ''} />
              {isTriggering ? 'Ingesting...' : 'Trigger Fetch Run'}
            </button>

          </div>
        </div>

        {/* Right Column: Architectural Highlights Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
            <Gauge size={22} color="var(--accent-cyan)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Token Bucket</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Capped at 10 req/min per source with continuous refills.</p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
            <ShieldCheck size={22} color="var(--accent-rose)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Circuit Breaker</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Trips open on 5 errors with 30s cooldown & half-open trial.</p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
            <Cpu size={22} color="var(--accent-emerald)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Stateless Workers</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Concurrent worker pool designed for horizontal scaling.</p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1rem' }}>
            <Database size={22} color="var(--accent-purple)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Plan B Fallback</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Secondary feed failover + stale DB cache fallback.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
