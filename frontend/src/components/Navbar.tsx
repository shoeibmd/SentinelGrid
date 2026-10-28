import React from 'react';
import { ShieldCheck, RefreshCw, Bell, Terminal } from 'lucide-react';

interface NavbarProps {
  currentTabName: string;
  onRefresh: () => void;
  refreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTabName, onRefresh, refreshing }) => {
  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
          {currentTabName}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '0.7rem',
          color: 'var(--accent-shield)',
          fontWeight: 600
        }}>
          <ShieldCheck size={14} />
          <span>Real-time Sentinel Active</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          title="Refresh Data"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(19, 29, 49, 0.8)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Ping Engine:</span>
          <span style={{ color: 'var(--accent-shield)', fontWeight: 700 }}>15s Probe Cycle</span>
        </div>
      </div>
    </header>
  );
};
