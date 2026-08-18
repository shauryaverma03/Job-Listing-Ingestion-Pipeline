import React from 'react';
import { Search, MapPin, Building, ExternalLink, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div id="listings-explorer-section" className="glass-panel" style={{ padding: '1.5rem' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>Ingested Job Listings</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {pagination?.total || 0} normalized job postings stored in database
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Source Tabs */}
          <div style={{ display: 'flex', background: 'rgba(31, 41, 55, 0.7)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            {['', 'RemoteOK', 'WeWorkRemotely'].map((src) => (
              <button
                key={src || 'all'}
                onClick={() => setSourceFilter(src)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: sourceFilter === src ? 'var(--accent-indigo)' : 'transparent',
                  color: sourceFilter === src ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {src || 'All Sources'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search title, company, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                borderRadius: '8px',
                background: 'rgba(31, 41, 55, 0.7)',
                border: '1px solid var(--border-glass)',
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
          Loading job listings...
        </div>
      ) : listings.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No listings found matching your search. Try triggering a fetch run above!
        </div>
      ) : (
        <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {listings.map((job) => (
            <div
              key={job.id}
              style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border-glass)',
                borderRadius: '10px',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border-glass-hover)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
            >
              <div>
                {/* Source & Stale badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: job.source === 'RemoteOK' ? 'var(--accent-cyan)' : 'var(--accent-purple)',
                    background: job.source === 'RemoteOK' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {job.source}
                  </span>

                  {job.isStale && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#fbbf24',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertTriangle size={12} /> Stale Data
                    </span>
                  )}
                </div>

                {/* Job Title & Company */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem', lineHeight: '1.3' }}>
                  {job.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                  <Building size={14} color="var(--text-muted)" />
                  <span>{job.company}</span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>{job.location}</span>
                </div>

                {/* Salary if present */}
                {job.salary && (
                  <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, marginBottom: '0.5rem' }}>
                    💰 {job.salary}
                  </div>
                )}

                {/* Tags */}
                {Array.isArray(job.tags) && job.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                    {job.tags.slice(0, 4).map((tag, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.72rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {new Date(job.fetchedAt).toLocaleDateString()}
                </span>

                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--accent-indigo)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Apply <ExternalLink size={14} />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(31, 41, 55, 0.7)',
                border: '1px solid var(--border-glass)',
                color: '#ffffff',
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page <= 1 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(31, 41, 55, 0.7)',
                border: '1px solid var(--border-glass)',
                color: '#ffffff',
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem'
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
