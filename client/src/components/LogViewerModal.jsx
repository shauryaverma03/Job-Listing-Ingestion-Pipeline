import React, { useState, useEffect } from 'react';
import { X, Terminal, Filter, RefreshCw, Trash2 } from 'lucide-react';

export function LogViewerModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [filterComponent, setFilterComponent] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchLogs();

    let interval;
    if (isAutoRefresh) {
      interval = setInterval(fetchLogs, 2000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isAutoRefresh]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (filterComponent && log.component !== filterComponent) return false;
    if (filterLevel && log.level !== filterLevel) return false;
    return true;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'info': return '#60a5fa';
      case 'warn': return '#fbbf24';
      case 'error': return '#f87171';
      case 'debug': return '#9ca3af';
      default: return '#ffffff';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color-glow)'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(17, 24, 39, 0.9)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>System Pipeline Logs</h3>
            <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px' }}>
              {filteredLogs.length} entries
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              style={{
                background: isAutoRefresh ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isAutoRefresh ? '#34d399' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} className={isAutoRefresh ? 'spin' : ''} /> {isAutoRefresh ? 'Live Streaming' : 'Paused'}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{
          padding: '0.75rem 1.25rem',
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Filter size={14} color="var(--text-muted)" />
          
          <select
            value={filterComponent}
            onChange={(e) => setFilterComponent(e.target.value)}
            style={{
              background: 'rgba(31, 41, 55, 0.7)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          >
            <option value="">All Components</option>
            <option value="Fetcher">Fetcher</option>
            <option value="FetcherService">FetcherService</option>
            <option value="RateLimiter">RateLimiter</option>
            <option value="CircuitBreaker">CircuitBreaker</option>
            <option value="Retry">Retry</option>
            <option value="Queue">Queue</option>
            <option value="WorkerPool">WorkerPool</option>
            <option value="Storage">Storage</option>
            <option value="Server">Server</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{
              background: 'rgba(31, 41, 55, 0.7)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          >
            <option value="">All Levels</option>
            <option value="info">INFO</option>
            <option value="warn">WARN</option>
            <option value="error">ERROR</option>
            <option value="debug">DEBUG</option>
          </select>
        </div>

        {/* Log Lines Output */}
        <div style={{
          padding: '1.25rem',
          overflowY: 'auto',
          flex: 1,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          background: '#090d16',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No log entries match the selected filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', gap: '8px', lineHeight: '1.4' }}>
                <span style={{ color: '#6b7280', flexShrink: 0 }}>
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span style={{ color: getLevelColor(log.level), fontWeight: 600, flexShrink: 0, width: '55px' }}>
                  [{log.level.toUpperCase()}]
                </span>
                <span style={{ color: '#a7f3d0', flexShrink: 0 }}>
                  [{log.component}]
                </span>
                <span style={{ color: '#e5e7eb' }}>
                  {log.message}
                  {log.meta && Object.keys(log.meta).length > 0 && (
                    <span style={{ color: '#9ca3af', marginLeft: '6px' }}>
                      {JSON.stringify(log.meta)}
                    </span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
