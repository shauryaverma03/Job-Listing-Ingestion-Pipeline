import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle, ShieldAlert, Gauge, Cpu, Terminal, Database, Play } from 'lucide-react';

const TOUR_STEPS = [
  {
    targetId: 'hero-header-section',
    icon: Sparkles,
    color: '#8b5cf6',
    title: 'Welcome to Job Ingestion Pipeline',
    subtitle: 'Resilient Scraper Architecture',
    description: 'This pipeline automatically ingests job listings on a schedule or on-demand without authentication walls. Let us explore each resilience component in action!',
    badge: 'Step 1 of 7'
  },
  {
    targetId: 'rate-limiter-card',
    icon: Gauge,
    color: '#06b6d4',
    title: 'Token-Bucket Rate Limiter',
    subtitle: 'Pacing & Traffic Control (10 req/min)',
    description: 'Prevents target public endpoints from throttling or blocking our scraper IP. Uses a token bucket that continuously refills over time to handle smooth burst traffic.',
    badge: 'Step 2 of 7'
  },
  {
    targetId: 'circuit-breaker-section',
    icon: ShieldAlert,
    color: '#ef4444',
    title: '3-State Circuit Breaker',
    subtitle: 'CLOSED ➔ OPEN ➔ HALF-OPEN State Machine',
    description: 'Trips to OPEN after 5 consecutive errors to prevent cascading failures. After a 30-second cooldown, it transitions to HALF-OPEN to test system recovery.',
    badge: 'Step 3 of 7'
  },
  {
    targetId: 'worker-pool-card',
    icon: Cpu,
    color: '#3b82f6',
    title: 'Stateless Worker Engine Pool',
    subtitle: 'Asynchronous Background Queue',
    description: 'Background cron jobs or manual triggers enqueue ingestion tasks. Stateless worker loops process queue tasks concurrently, making horizontal scaling effortless.',
    badge: 'Step 4 of 7'
  },
  {
    targetId: 'logs-button-trigger',
    icon: Terminal,
    color: '#10b981',
    title: 'System Pipeline Logs',
    subtitle: 'Authentic macOS Terminal Console',
    description: 'Inspect real-time structured logs in a macOS style window frame with traffic light buttons, live streaming, log level filtering, and download capabilities.',
    badge: 'Step 5 of 7'
  },
  {
    targetId: 'trigger-fetch-btn',
    icon: Play,
    color: '#10b981',
    title: 'Manual Ingestion Trigger',
    subtitle: 'On-Demand Execution',
    description: 'Click "Trigger Ingestion Run" at any time to push an immediate ingestion task to the queue and observe real-time rate limiting, retries, and deduplication.',
    badge: 'Step 6 of 7'
  },
  {
    targetId: 'listings-explorer-section',
    icon: Database,
    color: '#a855f7',
    title: 'Deduplicated SQLite Feed Explorer',
    subtitle: 'Normalized Job Listings Storage',
    description: 'Raw listings are normalized into a canonical schema and deduplicated on unique IDs in SQLite. Search, filter by source, or open direct application links.',
    badge: 'Step 7 of 7'
  }
];

export function InteractiveTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const updateTargetSpotlight = () => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }

    const step = TOUR_STEPS[currentStep];
    if (step && step.targetId) {
      const targetEl = document.getElementById(step.targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
          const rect = targetEl.getBoundingClientRect();
          setTargetRect({
            viewportTop: Math.max(0, rect.top - 6),
            viewportLeft: Math.max(0, rect.left - 6),
            width: rect.width + 12,
            height: rect.height + 12
          });
        }, 300);
      } else {
        setTargetRect(null);
      }
    }
  };

  useEffect(() => {
    updateTargetSpotlight();
    window.addEventListener('resize', updateTargetSpotlight);
    window.addEventListener('scroll', updateTargetSpotlight);
    return () => {
      window.removeEventListener('resize', updateTargetSpotlight);
      window.removeEventListener('scroll', updateTargetSpotlight);
    };
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const markTourCompleted = () => {
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
      {/* SVG Cutout Mask Overlay - Target Element Shines Through 100% Bright */}
      <svg
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'auto',
          zIndex: 9000
        }}
        onClick={handleDismiss}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White background fills mask (darkens screen) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            
            {/* Black cutout rectangle over target element */}
            {targetRect && (
              <rect
                x={targetRect.viewportLeft}
                y={targetRect.viewportTop}
                width={targetRect.width}
                height={targetRect.height}
                rx="10"
                ry="10"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Dark overlay with literal cutout hole */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(3, 7, 18, 0.82)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Dynamic Glowing Spotlight Frame Box over target element */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: `${targetRect.viewportTop}px`,
            left: `${targetRect.viewportLeft}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            border: `2.5px solid ${step.color}`,
            borderRadius: '12px',
            boxShadow: `0 0 25px ${step.color}aa, inset 0 0 15px ${step.color}33`,
            pointerEvents: 'none',
            zIndex: 9005,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      )}

      {/* Tour Step Tooltip Modal Card */}
      <div
        className="tour-card"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9010,
          width: '90%',
          maxWidth: '480px',
          background: '#0f172a',
          border: `1.5px solid ${step.color}`,
          boxShadow: `0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px ${step.color}33`,
          borderRadius: '16px',
          padding: '1.5rem'
        }}
      >
        {/* Step Badge & Close Button */}
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

        {/* Step Title & Icon */}
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
            <IconComponent size={26} color={step.color} />
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
            background: step.color,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Step Actions */}
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

          {/* Dots Indicator */}
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
              background: step.color,
              border: 'none',
              color: '#ffffff',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: `0 4px 14px ${step.color}50`
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
