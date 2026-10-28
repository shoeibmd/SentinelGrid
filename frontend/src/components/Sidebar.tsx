import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Server, 
  Activity, 
  AlertTriangle, 
  Layers, 
  FileText, 
  LogOut, 
  CheckCircle2, 
  Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'assets', label: 'Asset & Endpoints', icon: <Server size={18} /> },
    { id: 'ping', label: 'Network & Ping Monitor', icon: <Activity size={18} /> },
    { id: 'security', label: 'Incidents & Containment', icon: <AlertTriangle size={18} /> },
    { id: 'integrations', label: 'Integrations Hub', icon: <Layers size={18} /> },
    { id: 'audit', label: 'Audit & Compliance', icon: <FileText size={18} /> },
  ];

  return (
    <aside style={{
      width: '280px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0
    }}>
      {/* Brand Header with Digital Simple Shield Design */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            border: '1px solid var(--accent-shield)',
            borderRadius: '10px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-shield)',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
          }}>
            {/* Unique Digital Simple Shield Icon */}
            <Shield size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Sentinel</span><span style={{ color: 'var(--accent-shield)' }}>Grid</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Cyber Defense & Monitoring
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Status:</span>
          <span style={{ color: 'var(--accent-shield)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot online" /> PROTECTED
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px', fontWeight: 700 }}>
          Central Control Plane
        </div>

        {menuItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                color: isActive ? 'var(--accent-shield)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                borderLeft: isActive ? '3px solid var(--accent-shield)' : '3px solid transparent'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Operator User Card & Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'rgba(11, 15, 25, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#1e293b',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--accent-cyan)'
            }}>
              {user?.username?.substring(0, 2).toUpperCase() || 'OP'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {user?.username || 'Operator'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-shield)', fontWeight: 600 }}>
                {user?.role || 'Viewer'} Role
              </div>
            </div>
          </div>

          <button 
            onClick={logout} 
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center' }}>
          SentinelGrid Core v1.0.0 · Dockerized
        </div>
      </div>
    </aside>
  );
};
