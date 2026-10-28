import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Power, 
  FileWarning, 
  Search, 
  Terminal, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { Incident, IncidentSeverity, IncidentStatus } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { api } from '../services/api.js';

interface SecurityPageProps {
  incidents: Incident[];
  onRefresh: () => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({ incidents, onRefresh }) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const handleContainment = async (action: 'quarantine' | 'isolate' | 'isolate_and_shutdown') => {
    if (!selectedIncident) return;

    if (action === 'isolate_and_shutdown') {
      const confirmText = prompt(
        `CAUTION: Controlled shutdown will forcefully stop services on '${selectedIncident.assetName}'. Type "CONFIRM SHUTDOWN" to proceed:`
      );
      if (confirmText !== 'CONFIRM SHUTDOWN') {
        alert('Action aborted. Confirmation token did not match.');
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to execute '${action.toUpperCase()}' on ${selectedIncident.assetName}?`)) {
        return;
      }
    }

    try {
      setActionLoading(true);
      const res = await api.executeContainment(selectedIncident.id, action);
      alert(res.message);
      setSelectedIncident(res.incident);
      onRefresh();
    } catch (err: any) {
      alert(`Containment execution failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status: IncidentStatus) => {
    if (!selectedIncident) return;
    try {
      setActionLoading(true);
      const updated = await api.updateIncidentStatus(selectedIncident.id, status, statusNote);
      setSelectedIncident(updated);
      setStatusNote('');
      onRefresh();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Cyber Defense & Incident Containment</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Automated correlation of Wazuh SIEM, FIM alerts, malware detection, and automated endpoint isolation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Response Mode:</span>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-shield)',
            color: 'var(--accent-shield)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.75rem'
          }}>
            AUTOMATED GUARD ACTIVE
          </span>
        </div>
      </div>

      {/* Grid: Incident Queue & Forensics Action Center */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Incident List */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: 'var(--accent-rose)' }} />
            <span>Active Incident Stream ({incidents.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidents.map(inc => {
              const isSelected = selectedIncident?.id === inc.id;

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid var(--accent-rose)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(244, 63, 94, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: inc.severity === 'critical' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: inc.severity === 'critical' ? '#f43f5e' : '#f59e0b'
                      }}>
                        {inc.severity.toUpperCase()}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{inc.title}</span>
                    </div>
                    <StatusBadge status={inc.status} size="sm" />
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {inc.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>Target: <strong style={{ color: '#fff' }}>{inc.assetName}</strong></span>
                    <span>{new Date(inc.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident Detail & Containment Action Panel */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedIncident ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                    Incident Investigation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ID: {selectedIncident.id}
                  </div>
                </div>
                <StatusBadge status={selectedIncident.status} />
              </div>

              {/* Containment Action Bar */}
              <div style={{ background: '#0b1324', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={14} style={{ color: 'var(--accent-shield)' }} />
                  <span>Enforce Automated Containment</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => handleContainment('quarantine')}
                    disabled={actionLoading || selectedIncident.status === 'quarantined'}
                    className="btn btn-warning"
                    style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    <FileWarning size={14} />
                    <span>Quarantine Malicious Files</span>
                  </button>

                  <button
                    onClick={() => handleContainment('isolate')}
                    disabled={actionLoading || selectedIncident.status === 'isolated'}
                    className="btn btn-danger"
                    style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    <Lock size={14} />
                    <span>Isolate Endpoint Network</span>
                  </button>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button
                    onClick={() => handleContainment('isolate_and_shutdown')}
                    disabled={actionLoading}
                    className="btn btn-outline"
                    style={{ width: '100%', fontSize: '0.75rem', justifyContent: 'center', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fda4af' }}
                  >
                    <Power size={14} />
                    <span>Emergency Controlled Shutdown (Safeguarded)</span>
                  </button>
                </div>
              </div>

              {/* Forensic Details */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  Forensic Telemetry & Evidence
                </div>

                <div style={{
                  background: '#080d1a',
                  padding: '12px',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  color: '#94a3b8'
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {JSON.stringify(selectedIncident.forensicData || {}, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Resolve / Status Controls */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Resolved</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus('investigating')}
                  disabled={actionLoading}
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <Info size={14} />
                  <span>Under Investigation</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Select an incident from the stream.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
