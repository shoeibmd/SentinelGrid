import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  Play, 
  Trash2, 
  Clock, 
  Wifi, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight 
} from 'lucide-react';
import { PingMonitor, PingHistoryEntry, CheckType } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { api } from '../services/api.js';

interface PingMonitoringPageProps {
  monitors: PingMonitor[];
  onRefresh: () => void;
}

export const PingMonitoringPage: React.FC<PingMonitoringPageProps> = ({ monitors, onRefresh }) => {
  const [selectedMonitor, setSelectedMonitor] = useState<PingMonitor | null>(monitors[0] || null);
  const [history, setHistory] = useState<PingHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [probingId, setProbingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [port, setPort] = useState<number | undefined>(undefined);
  const [checkType, setCheckType] = useState<CheckType>('icmp');
  const [intervalSeconds, setIntervalSeconds] = useState(15);
  const [timeoutMs, setTimeoutMs] = useState(2500);
  const [warningThresholdMs, setWarningThresholdMs] = useState(60);
  const [criticalThresholdMs, setCriticalThresholdMs] = useState(200);

  // Load history when monitor selected
  const handleSelectMonitor = async (m: PingMonitor) => {
    setSelectedMonitor(m);
    try {
      setHistoryLoading(true);
      const data = await api.getMonitorHistory(m.id, 25);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTriggerProbe = async (id: string) => {
    try {
      setProbingId(id);
      await api.triggerCheck(id);
      onRefresh();
      if (selectedMonitor?.id === id) {
        const data = await api.getMonitorHistory(id, 25);
        setHistory(data);
      }
    } catch (err: any) {
      alert(`Probe failed: ${err.message}`);
    } finally {
      setProbingId(null);
    }
  };

  const handleCreateMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMonitor({
        name,
        target,
        port: port ? Number(port) : undefined,
        checkType,
        intervalSeconds: Number(intervalSeconds),
        timeoutMs: Number(timeoutMs),
        warningThresholdMs: Number(warningThresholdMs),
        criticalThresholdMs: Number(criticalThresholdMs),
        enabled: true
      });
      setIsModalOpen(false);
      setName('');
      setTarget('');
      setPort(undefined);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to add monitor: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ping monitor '${name}'?`)) return;
    try {
      await api.deleteMonitor(id);
      if (selectedMonitor?.id === id) setSelectedMonitor(null);
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Network Ping & Availability Monitoring</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            High-frequency ICMP echo, TCP port, and HTTP availability probes with sub-millisecond precision.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>New Ping Monitor</span>
        </button>
      </div>

      {/* Main Grid: Target Monitors & Real-time History Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Monitors List */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wifi size={18} style={{ color: 'var(--accent-shield)' }} />
            <span>Configured Targets ({monitors.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {monitors.map(m => {
              const isSelected = selectedMonitor?.id === m.id;
              const isProbing = probingId === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMonitor(m)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid var(--accent-shield)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {m.target}{m.port ? `:${m.port}` : ''} · <span style={{ textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>{m.checkType}</span> · Every {m.intervalSeconds}s
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 800, 
                        fontSize: '1rem',
                        color: (m.lastLatencyMs || 0) > m.warningThresholdMs ? 'var(--accent-amber)' : 'var(--accent-shield)'
                      }}>
                        {m.lastLatencyMs !== undefined ? `${m.lastLatencyMs} ms` : '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Loss: {m.packetLossPercent}%
                      </div>
                    </div>

                    <StatusBadge status={m.status} size="sm" />

                    <button
                      onClick={(e) => { e.stopPropagation(); handleTriggerProbe(m.id); }}
                      disabled={isProbing}
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      title="Probe Now"
                    >
                      <Play size={12} className={isProbing ? 'animate-spin' : ''} />
                      <span>{isProbing ? 'Pinging...' : 'Ping'}</span>
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(m.id, m.name); }}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Monitor Deep Dive / Latency Sparkline */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedMonitor ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                    {selectedMonitor.name} Telemetry
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Target: {selectedMonitor.target}
                  </div>
                </div>
                <StatusBadge status={selectedMonitor.status} />
              </div>

              {/* Threshold Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#0b1324', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Latency</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-shield)', fontFamily: 'var(--font-mono)' }}>
                    {selectedMonitor.lastLatencyMs !== undefined ? `${selectedMonitor.lastLatencyMs} ms` : '—'}
                  </div>
                </div>

                <div style={{ background: '#0b1324', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Warn Threshold</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                    {selectedMonitor.warningThresholdMs} ms
                  </div>
                </div>

                <div style={{ background: '#0b1324', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Crit Threshold</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                    {selectedMonitor.criticalThresholdMs} ms
                  </div>
                </div>
              </div>

              {/* Historical Probe Table */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  Recent Ping Responses (Last 20 Probes)
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  <table className="sg-table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Latency</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                            {historyLoading ? 'Loading probe history...' : 'No probes recorded yet.'}
                          </td>
                        </tr>
                      ) : (
                        history.map(h => (
                          <tr key={h.id}>
                            <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {new Date(h.recordedAt).toLocaleTimeString()}
                            </td>
                            <td><StatusBadge status={h.status} size="sm" /></td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: h.latencyMs > 50 ? 'var(--accent-amber)' : 'var(--accent-shield)' }}>
                              {h.latencyMs} ms
                            </td>
                            <td style={{ color: 'var(--text-muted)' }}>{h.message || 'OK'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Select a target monitor to inspect telemetry.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Add Ping Monitor */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{ width: '520px', maxWidth: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              Create Network Ping Check Target
            </h3>

            <form onSubmit={handleCreateMonitor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Friendly Target Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS US-East Gateway"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Host / IP / URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="8.8.8.8 or gateway.local"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Check Type *</label>
                  <select
                    value={checkType}
                    onChange={e => setCheckType(e.target.value as CheckType)}
                    className="input-field"
                    style={{ background: '#0b1324' }}
                  >
                    <option value="icmp">ICMP Ping</option>
                    <option value="tcp">TCP Port</option>
                    <option value="http">HTTP/HTTPS</option>
                  </select>
                </div>
              </div>

              {checkType === 'tcp' && (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Port *</label>
                  <input
                    type="number"
                    placeholder="e.g. 443, 22, 53"
                    value={port || ''}
                    onChange={e => setPort(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Probe Interval (seconds)</label>
                  <input
                    type="number"
                    value={intervalSeconds}
                    onChange={e => setIntervalSeconds(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Timeout (ms)</label>
                  <input
                    type="number"
                    value={timeoutMs}
                    onChange={e => setTimeoutMs(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Warning Threshold (ms)</label>
                  <input
                    type="number"
                    value={warningThresholdMs}
                    onChange={e => setWarningThresholdMs(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Critical Threshold (ms)</label>
                  <input
                    type="number"
                    value={criticalThresholdMs}
                    onChange={e => setCriticalThresholdMs(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save & Start Monitoring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
