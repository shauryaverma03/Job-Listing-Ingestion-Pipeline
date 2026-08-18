import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle, ShieldAlert, Gauge, Cpu, Terminal, Database, Play } from 'lucide-react';

const TOUR_STEPS = [
  {
    targetId: 'hero-header-section',
    icon: Sparkles,
    color: '#8b5cf6',
    title: 'Welcome to Job Ingestion Pipeline',
    subtitle: 'Resilient Scraping Architecture',
    description: 'This pipeline ingests listings on a schedule or on-demand without auth walls. Let us tour each resilience feature in action!',
    badge: 'Step 1 of 7'
  },
  {
    targetId: 'rate-limiter-card',
    icon: Gauge,
    color: '#06b6d4',
    title: 'Token-Bucket Rate Limiter',
    subtitle: 'Traffic Control (10 req/min)',
    description: 'Prevents target public endpoints from blocking our scraper IP. Uses a token bucket that continuously refills over time to handle smooth bursts.',
    badge: 'Step 2 of 7'
  },
  {
    targetId: 'circuit-breaker-section',
    icon: ShieldAlert,
    color: '#ef4444',
    title: '3-State Circuit Breaker',
    subtitle: 'Closed ➔ Open ➔ Half-Open State Machine',
    description: 'Trips to OPEN after 5 consecutive errors to prevent cascading failures. After a 30s cooldown, transitions to HALF-OPEN to test recovery.',
    badge: 'Step 3 of 7'
  },
  {
    targetId: 'worker-pool-card',
    icon: Cpu,
    color: '#3b82f6',
    title: 'Stateless Worker Pool',
    subtitle: 'Asynchronous Background Queue',
    description: 'Background cron (every 5m) or manual triggers enqueue jobs. Stateless worker loops process queue tasks concurrently, making horizontal scaling simple.',
    badge: 'Step 4 of 7'
  },
  {
    targetId: 'logs-button-trigger',
    icon: Terminal,
    color: '#10b981',
    title: 'System Pipeline Logs',
    subtitle: 'Authentic macOS Terminal Viewer',
    description: 'Inspect real-time structured logs in a macOS style window frame with traffic light buttons, live streaming, level highlights, search filtering, and log export.',
    badge: 'Step 5 of 7'
  },
  {
    targetId: 'trigger-fetch-btn',
    icon: Play,
    color: '#f59e0b',
    title: 'Manual Fetch Ingestion Trigger',
    subtitle: 'On-Demand Execution',
    description: 'Click "Trigger Fetch Run" at any time to push an immediate ingestion task to the queue and observe pipeline metrics update in real time.',
    badge: 'Step 6 of 7'
  },
  {
    targetId: 'listings-explorer-section',
    icon: Database,
    color: '#a855f7',
    title: 'Deduplicated SQLite Explorer',
    subtitle: 'Normalized Listings Storage',
    description: 'Listings are normalized into a canonical schema and deduplicated on unique IDs in SQLite. Search, filter by source, or open direct application links.',
    badge: 'Step 7 of 7'
  }
];

export function InteractiveTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Remove any active spotlight highlights when tour closes
      document.querySelectorAll('.tour-spotlight-active').forEach(el => {
        el.classList.remove('tour-spotlight-active');
      });
      return;
    }

    const step = TOUR_STEPS[currentStep];
    if (step && step.targetId) {
      // Clear previous spotlights
      document.querySelectorAll('.tour-spotlight-active').forEach(el => {
        el.classList.remove('tour-spotlight-active');
      });

      const targetEl = document.getElementById(step.targetId);
      if (targetEl) {
        targetEl.classList.add('tour-spotlight-active');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const markTourCompleted = () => {
    // Save completion state in localStorage & Cookie so it persists across sessions
    localStorage.setItem('has_completed_pipeline_tour', 'true');
    document.cookie = "has_completed_pipeline_tour=true; max-age=31536000; path=/";
  };

  const handleNext = () => {
    if (isLastStep) {
      markTourCompleted();
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleDismiss = () => {
    markTourCompleted();
    onClose();
  };

  return (
    <>
      {/* Dark Blur Overlay */}
      <div className="tour-overlay" onClick={handleDismiss} />

      {/* Tour Step Tooltip Modal Card */}
      <div className="tour-card" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: step.color,
            background: `${step.color}22`,
            border: `1px solid ${step.color}44`,
            padding: '3px 10px',
            borderRadius: '9999px',
            fontFamily: 'var(--font-mono)'
          }}>
            {step.badge}
          </span>

          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Content */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{
            background: `${step.color}20`,
            border: `1px solid ${step.color}50`,
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <IconComponent size={28} color={step.color} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>
              {step.title}
            </h3>
            <div style={{ fontSize: '0.8rem', color: step.color, fontWeight: 600, marginBottom: '0.5rem' }}>
              {step.subtitle}
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
              {step.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.08)', height: '4px', borderRadius: '2px', marginBottom: '1.25rem', overflow: 'hidden' }}>
          <div style={{
            width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${step.color}, #6366f1)`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentStep === 0 ? 'var(--text-dim)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: idx === currentStep ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: idx === currentStep ? step.color : 'rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            style={{
              background: `linear-gradient(135deg, ${step.color} 0%, #4f46e5 100%)`,
              border: 'none',
              color: '#ffffff',
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: `0 4px 12px ${step.color}40`
            }}
          >
            {isLastStep ? (
              <>Finish Tour <CheckCircle size={16} /></>
            ) : (
              <>Next Step <ArrowRight size={16} /></>
            )}
          </button>

        </div>

      </div>
    </>
  );
}
