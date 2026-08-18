import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal, Filter, RefreshCw, Copy, Download, Trash2, Maximize2, Minimize2, Check } from 'lucide-react';

export function MacTerminalLogsModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [filterComponent, setFilterComponent] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef(null);

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
      interval = setInterval(fetchLogs, 1500);
    }
    return () => clearInterval(interval);
  }, [isOpen, isAutoRefresh]);

  useEffect(() => {
    if (isAutoRefresh && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isAutoRefresh]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (filterComponent && log.component !== filterComponent) return false;
    if (filterLevel && log.level !== filterLevel) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(query);
      const matchComp = log.component.toLowerCase().includes(query);
      return matchMsg || matchComp;
    }
    return true;
  });

  const handleCopy = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.component}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.component}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-logs-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setLogs([]);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'info': return '#38bdf8';
      case 'warn': return '#fbbf24';
      case 'error': return '#f43f5e';
      case 'debug': return '#c084fc';
      default: return '#e2e8f0';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMaximized ? '0' : '1.5rem'
    }}>
      <div className="mac-terminal-window" style={{
        width: isMaximized ? '100vw' : '100%',
        maxWidth: isMaximized ? '100vw' : '960px',
        height: isMaximized ? '100vh' : '82vh',
        borderRadius: isMaximized ? '0' : '12px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s ease'
      }}>
        
        {/* macOS Titlebar */}
        <div className="mac-titlebar">
          <div className="mac-traffic-lights">
            <span className="mac-btn mac-btn-close" title="Close Window" onClick={onClose} />
            <span className="mac-btn mac-btn-minimize" title="Pause Stream" onClick={() => setIsAutoRefresh(!isAutoRefresh)} />
            <span className="mac-btn mac-btn-maximize" title="Toggle Fullscreen" onClick={() => setIsMaximized(!isMaximized)} />
          </div>

          <div className="mac-title">
            System Pipeline Logs — bash — 120×35
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.7rem',
              color: isAutoRefresh ? '#34d399' : '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isAutoRefresh ? '#34d399' : '#fbbf24',
                boxShadow: isAutoRefresh ? '0 0 6px #34d399' : 'none'
              }} />
              {isAutoRefresh ? 'LIVE STREAM' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Terminal Controls Toolbar */}
        <div style={{
          padding: '0.65rem 1rem',
          background: '#161b22',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          {/* Filters & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <select
              value={filterComponent}
              onChange={(e) => setFilterComponent(e.target.value)}
              style={{
                background: '#0d1117',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#c9d1d9',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
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
                background: '#0d1117',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#c9d1d9',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <option value="">All Levels</option>
              <option value="info">INFO</option>
              <option value="warn">WARN</option>
              <option value="error">ERROR</option>
              <option value="debug">DEBUG</option>
            </select>

            <input
              type="text"
              placeholder="grep logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: '#0d1117',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#38bdf8',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                width: '140px'
              }}
            />
          </div>

          {/* Terminal Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleCopy}
              title="Copy terminal logs"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: copied ? '#34d399' : '#8b949e',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={handleDownload}
              title="Export log file"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#8b949e',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Download size={14} /> Export
            </button>

            <button
              onClick={handleClear}
              title="Clear terminal view"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#8b949e',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div style={{
          flex: 1,
          background: '#0b0e14',
          padding: '1rem 1.25rem',
          overflowY: 'auto',
          fontSize: '0.82rem',
          lineHeight: '1.6',
          color: '#e6edf3'
        }}>
          {/* Initial terminal banner prompt */}
          <div style={{ color: '#7d8590', marginBottom: '0.75rem', borderBottom: '1px dashed rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem' }}>
            <span style={{ color: '#34d399', fontWeight: 600 }}>shaurya@pipeline-mac</span>:<span style={{ color: '#60a5fa' }}>~/logs</span>$ tail -f /var/log/ingestion-pipeline.log --lines 200
            <br />
            <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>[System initialized] Listening for scraper events, token bucket refills, and circuit breaker status changes.</span>
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{ color: '#6e7681', padding: '1rem 0' }}>
              No log outputs to display.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '2px', wordBreak: 'break-all' }}>
                <span style={{ color: '#6e7681', flexShrink: 0 }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>

                <span style={{
                  color: getLevelColor(log.level),
                  fontWeight: 700,
                  flexShrink: 0,
                  minWidth: '55px'
                }}>
                  [{log.level.toUpperCase()}]
                </span>

                <span style={{ color: '#a7f3d0', fontWeight: 600, flexShrink: 0 }}>
                  [{log.component}]
                </span>

                <span style={{ color: '#f0f6fc' }}>
                  {log.message}
                  {log.meta && Object.keys(log.meta).length > 0 && (
                    <span style={{ color: '#8b949e', marginLeft: '6px' }}>
                      {JSON.stringify(log.meta)}
                    </span>
                  )}
                </span>
              </div>
            ))
          )}

          {/* Active Terminal Cursor Line */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', color: '#34d399', fontWeight: 600 }}>
            <span>shaurya@pipeline-mac:~$</span>
            <span className="terminal-cursor" />
          </div>

          <div ref={terminalEndRef} />
        </div>

      </div>
    </div>
  );
}
