import React, { useState, useEffect, useCallback } from 'react';
import { HeroFrontPage } from './components/HeroFrontPage';
import { MetricsOverview } from './components/MetricsOverview';
import { CircuitBreakerCard } from './components/CircuitBreakerCard';
import { ListingsExplorer } from './components/ListingsExplorer';
import { MacTerminalLogsModal } from './components/MacTerminalLogsModal';
import { InteractiveTour } from './components/InteractiveTour';

export default function App() {
  const [statusData, setStatusData] = useState(null);
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Theme Management
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'default';
  });

  const handleSelectTheme = (themeId) => {
    if (themeId === currentTheme) return;
    setCurrentTheme(themeId);
    localStorage.setItem('app_theme', themeId);
    if (themeId === 'default') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', themeId);
    }
  };

  useEffect(() => {
    if (currentTheme !== 'default') {
      document.body.setAttribute('data-theme', currentTheme);
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [currentTheme]);

  // Session / Cookie Check for Auto-Launching Guided Tour on First Visit
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('has_completed_pipeline_tour') || document.cookie.includes('has_completed_pipeline_tour=true');
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch Pipeline Health Status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatusData(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  }, []);

  // Fetch Normalized Listings
  const fetchListingsData = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search,
        source: sourceFilter
      });
      const res = await fetch(`/api/listings?${queryParams.toString()}`);
      const data = await res.json();
      if (data.listings) {
        setListings(data.listings);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch listings', err);
    } finally {
      setIsLoadingListings(false);
    }
  }, [page, search, sourceFilter]);

  // Polling status every 1 second
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Refetch listings on search/filter/page change
  useEffect(() => {
    fetchListingsData();
  }, [fetchListingsData]);

  // Trigger Manual Ingestion Run
  const handleTriggerFetch = async () => {
    setIsTriggering(true);
    try {
      const res = await fetch('/api/fetch/trigger', { method: 'POST' });
      const data = await res.json();
      console.log('Trigger response:', data);
      
      setTimeout(() => {
        fetchStatus();
        fetchListingsData();
        setIsTriggering(false);
      }, 2200);
    } catch (err) {
      console.error('Failed to trigger fetch run', err);
      setIsTriggering(false);
    }
  };

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Front Main Page Hero Banner */}
      <HeroFrontPage
        onStartTour={() => setIsTourOpen(true)}
        onOpenTerminal={() => setIsLogModalOpen(true)}
        onTriggerFetch={handleTriggerFetch}
        isTriggering={isTriggering}
        lastUpdated={lastUpdated}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Real-time Health Metrics Cards */}
      <MetricsOverview
        metrics={statusData?.metrics}
        config={statusData?.config}
        rateLimiters={statusData?.rateLimiters}
        workerPool={statusData?.workerPool}
      />

      {/* 3-State Circuit Breaker Status Cards & Failure Simulation */}
      <CircuitBreakerCard
        circuitBreakers={statusData?.circuitBreakers}
        simulatedFailures={statusData?.simulatedFailures}
        onRefresh={() => {
          fetchStatus();
          fetchListingsData();
        }}
      />

      {/* Deduplicated Job Listings Explorer Grid */}
      <ListingsExplorer
        listings={listings}
        pagination={pagination}
        search={search}
        setSearch={(val) => { setSearch(val); setPage(1); }}
        sourceFilter={sourceFilter}
        setSourceFilter={(val) => { setSourceFilter(val); setPage(1); }}
        onPageChange={(newPage) => setPage(newPage)}
        isLoading={isLoadingListings}
      />

      {/* Authentic macOS Terminal Window Log Drawer */}
      <MacTerminalLogsModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />

      {/* Guided Step-by-Step Interactive Spotlight Tour Modal */}
      <InteractiveTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

    </div>
  );
}
