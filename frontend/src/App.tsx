import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { Sidebar } from './components/Sidebar.js';
import { Navbar } from './components/Navbar.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AssetsPage } from './pages/AssetsPage.js';
import { PingMonitoringPage } from './pages/PingMonitoringPage.js';
import { SecurityPage } from './pages/SecurityPage.js';
import { IntegrationsPage } from './pages/IntegrationsPage.js';
import { AuditLogsPage } from './pages/AuditLogsPage.js';
import { api } from './services/api.js';
import { Asset, PingMonitor, Incident, IntegrationStatus } from './types/index.js';

export const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // Global State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [monitors, setMonitors] = useState<PingMonitor[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  const loadData = async (isBackground = false) => {
    if (!user) return;
    try {
      if (!isBackground) setRefreshing(true);
      const [assetsData, monitorsData, incidentsData, integrationsData] = await Promise.all([
        api.getAssets(),
        api.getMonitors(),
        api.getIncidents(),
        api.getIntegrations()
      ]);
      setAssets(assetsData);
      setMonitors(monitorsData);
      setIncidents(incidentsData);
      setIntegrations(integrationsData);
    } catch (err) {
      console.error('Failed to load SentinelGrid telemetry:', err);
    } finally {
      if (!isBackground) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
      // Polling cycle every 10s for real-time dashboard updates
      const interval = setInterval(() => {
        loadData(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--accent-shield)',
        fontFamily: 'var(--font-mono)'
      }}>
        Initializing SentinelGrid Control Plane...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Infrastructure & Defense Overview';
      case 'assets': return 'Asset & Endpoint Inventory';
      case 'ping': return 'Network Ping & Availability Probes';
      case 'security': return 'Security Incidents & Automated Containment';
      case 'integrations': return 'Open-Source Integrations Hub';
      case 'audit': return 'Tamper-Evident Audit & Compliance Log';
      default: return 'SentinelGrid';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Central Sidebar */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar 
          currentTabName={getTabTitle(currentTab)} 
          onRefresh={() => loadData(false)}
          refreshing={refreshing}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {currentTab === 'dashboard' && (
            <DashboardPage
              assets={assets}
              monitors={monitors}
              incidents={incidents}
              integrations={integrations}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'assets' && (
            <AssetsPage
              assets={assets}
              onRefresh={() => loadData(false)}
            />
          )}

          {currentTab === 'ping' && (
            <PingMonitoringPage
              monitors={monitors}
              onRefresh={() => loadData(false)}
            />
          )}

          {currentTab === 'security' && (
            <SecurityPage
              incidents={incidents}
              onRefresh={() => loadData(false)}
            />
          )}

          {currentTab === 'integrations' && (
            <IntegrationsPage
              integrations={integrations}
              onRefresh={() => loadData(false)}
            />
          )}

          {currentTab === 'audit' && (
            <AuditLogsPage />
          )}
        </main>
      </div>
    </div>
  );
};
