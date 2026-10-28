import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Play, 
  Settings, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';
import { IntegrationStatus } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { api } from '../services/api.js';

interface IntegrationsPageProps {
  integrations: IntegrationStatus[];
  onRefresh: () => void;
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({ integrations, onRefresh }) => {
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestConnection = async (id: string) => {
    try {
      setTestingId(id);
      const res = await api.testIntegration(id);
      alert(`Integration Test: ${res.message} (Roundtrip: ${res.latencyMs}ms)`);
      onRefresh();
    } catch (err: any) {
      alert(`Integration Test Failed: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const getIntegrationIcon = (name: string) => {
    switch (name) {
      case 'grafana': return <Layers size={22} style={{ color: '#f97316' }} />;
      case 'prometheus': return <Cpu size={22} style={{ color: '#ef4444' }} />;
      case 'uptime_kuma': return <CheckCircle2 size={22} style={{ color: '#10b981' }} />;
      case 'wazuh': return <ShieldCheck size={22} style={{ color: '#3b82f6' }} />;
      case 'vmware': return <Settings size={22} style={{ color: '#06b6d4' }} />;
      default: return <Layers size={22} />;
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Open-Source Integrations Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Unified management of Grafana, Prometheus, Uptime Kuma, Wazuh SIEM, and VMware vSphere/ESXi.
          </p>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.8rem',
          color: 'var(--accent-shield)',
          fontWeight: 700
        }}>
          5 Subsystems Connected
        </div>
      </div>

      {/* Integrations Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {integrations.map(item => {
          const isTesting = testingId === item.id;

          return (
            <div 
              key={item.id} 
              className="glass-panel" 
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '16px',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#0b1324', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      {getIntegrationIcon(item.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{item.displayName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {item.baseUrl}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                  {item.summary}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sync: {item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleTimeString() : 'Pending'}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleTestConnection(item.id)}
                    disabled={isTesting}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    <Play size={12} className={isTesting ? 'animate-spin' : ''} />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Capabilities & Permissions Guide */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
          Architectural Integration Specifications & Security Boundaries
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ background: '#0b1324', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#f97316' }}>Grafana & Prometheus</strong>
            <p style={{ marginTop: '4px' }}>
              Communicates via internal Docker bridge network (`backend-net`). No credentials or tokens exposed to public client. Embedded panels use time-limited signed tokens.
            </p>
          </div>

          <div style={{ background: '#0b1324', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#3b82f6' }}>Wazuh SIEM & HIDS</strong>
            <p style={{ marginTop: '4px' }}>
              API connection on port 55000 using dedicated least-privilege service account. Dispatches active response actions and ingests real-time alert webhooks.
            </p>
          </div>

          <div style={{ background: '#0b1324', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#06b6d4' }}>VMware vSphere / ESXi</strong>
            <p style={{ marginTop: '4px' }}>
              pyVmomi / vSphere REST adapter. Strict isolation between guest VM operations and hypervisor host power controls to avoid accidental infrastructure denial of service.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
