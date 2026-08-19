import React from 'react';
import { Search, MapPin, Building, ExternalLink, AlertTriangle, Calendar, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

export function ListingsExplorer({
  listings,
  pagination,
  search,
  setSearch,
  sourceFilter,
  setSourceFilter,
  onPageChange,
  isLoading
}) {
  return (
    <div id="listings-explorer-section" className="glass-panel" style={{ padding: '1.5rem', background: '#0c1222', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      
      {/* Panel Header & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.85rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={20} color="var(--accent-primary)" />
            Deduplicated Job Feed Explorer
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {pagination?.total || 0} normalized job postings stored in SQLite database
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Source Tabs */}
          <div style={{ display: 'flex', background: '#090d16', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {['', 'RemoteOK', 'WeWorkRemotely'].map((src) => (
              <button
                key={src || 'all'}
                onClick={() => setSourceFilter(src)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: sourceFilter === src ? 'var(--accent-primary)' : 'transparent',
                  color: sourceFilter === src ? '#090d16' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                {src || 'All Sources'}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search title, company, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.4rem',
                borderRadius: '8px',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading ingested job postings from database...
        </div>
      ) : listings.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No listings found matching your search. Click "Trigger Ingestion Run" above to fetch latest feeds!
        </div>
      ) : (
        <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem', marginBottom: '1.5rem' }}>
          {listings.map((job) => (
            <div
              key={job.id}
              style={{
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                {/* Source & Stale badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: job.source === 'RemoteOK' ? 'var(--accent-cyan)' : 'var(--accent-purple)',
                    background: job.source === 'RemoteOK' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(168, 85, 247, 0.12)',
                    padding: '3px 9px',
                    borderRadius: '4px'
                  }}>
                    {job.source}
                  </span>

                  {job.isStale && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#fbbf24',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      padding: '3px 9px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertTriangle size={12} /> Stale Cache
                    </span>
                  )}
                </div>

                {/* Job Title & Company */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem', lineHeight: '1.35' }}>
                  {job.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem' }}>
                  <Building size={14} color="var(--text-muted)" />
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{job.company}</span>
                  <span>•</span>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>{job.location}</span>
                </div>

                {/* Salary if present */}
                {job.salary && (
                  <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700, marginBottom: '0.65rem' }}>
                    💰 {job.salary}
                  </div>
                )}

                {/* Tags */}
                {Array.isArray(job.tags) && job.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1.1rem' }}>
                    {job.tags.slice(0, 4).map((tag, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: 'var(--text-muted)'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-mono)' }}>
                  <Calendar size={13} /> {new Date(job.fetchedAt).toLocaleDateString()}
                </span>

                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--accent-primary)',
                    textDecoration: 'none',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Apply Listing <ExternalLink size={14} />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total listings)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page <= 1 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
