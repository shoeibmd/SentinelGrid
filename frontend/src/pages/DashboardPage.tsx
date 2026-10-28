import React from 'react';
import { 
  Server, 
  Activity, 
  ShieldAlert, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';
import { StatCard } from '../components/StatCard.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Asset, PingMonitor, Incident, IntegrationStatus } from '../types/index.js';

interface DashboardPageProps {
  assets: Asset[];
  monitors: PingMonitor[];
  incidents: Incident[];
  integrations: IntegrationStatus[];
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  assets,
  monitors,
  incidents,
  integrations,
  onNavigate
}) => {
  const onlineAssets = assets.filter(a => a.status === 'online').length;
  const activeMonitors = monitors.filter(m => m.enabled).length;
  const healthyMonitors = monitors.filter(m => m.status === 'up').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
  const healthyIntegrations = integrations.filter(i => i.status === 'healthy').length;

  const avgLatency = monitors.length > 0
    ? (monitors.reduce((acc, m) => acc + (m.lastLatencyMs || 0), 0) / monitors.length).toFixed(1)
    : '0';

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Platform Banner */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            SentinelGrid Unified Cyber Defense & Operations Center
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            One platform. Complete visibility. Automated defense. Monitoring Grafana, Prometheus, Uptime Kuma, Wazuh, and VMware.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => onNavigate('security')} className="btn btn-danger" style={{ fontSize: '0.8rem' }}>
            <ShieldAlert size={16} />
            <span>Active Incidents ({criticalIncidents})</span>
          </button>
          <button onClick={() => onNavigate('ping')} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
            <Activity size={16} />
            <span>Ping Probes ({healthyMonitors}/{monitors.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <StatCard
          title="Monitored Endpoints"
          value={assets.length}
          subtext={`${onlineAssets} healthy / ${assets.length - onlineAssets} flagged`}
          icon={<Server size={22} />}
          trend={{ value: `${Math.round((onlineAssets / (assets.length || 1)) * 100)}% online`, positive: true }}
          accentColor="var(--accent-shield)"
        />

        <StatCard
          title="Ping Availability"
          value={`${healthyMonitors}/${monitors.length}`}
          subtext={`Avg Probe Latency: ${avgLatency}ms`}
          icon={<Activity size={22} />}
          trend={{ value: `${avgLatency} ms`, positive: true }}
          accentColor="var(--accent-cyan)"
        />

        <StatCard
          title="Active Threat Alerts"
          value={incidents.length}
          subtext={`${criticalIncidents} require containment`}
          icon={<ShieldAlert size={22} />}
          trend={{ value: criticalIncidents > 0 ? 'Threat Active' : 'Normal', positive: criticalIncidents === 0 }}
          accentColor="var(--accent-rose)"
        />

        <StatCard
          title="Connected Integrations"
          value={`${healthyIntegrations}/${integrations.length}`}
          subtext="Wazuh, VMware, Grafana, Prom, Kuma"
          icon={<Layers size={22} />}
          trend={{ value: '100% synced', positive: true }}
          accentColor="var(--accent-amber)"
        />
      </div>

      {/* Two Column Grid: Ping Target Availability & Security Incidents */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Network Ping Probes */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Network Ping & Probe Status</span>
            </div>
            <button 
              onClick={() => onNavigate('ping')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {monitors.slice(0, 4).map(m => (
              <div 
                key={m.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>{m.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {m.target}{m.port ? `:${m.port}` : ''} ({m.checkType.toUpperCase()})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: (m.lastLatencyMs || 0) > m.warningThresholdMs ? 'var(--accent-amber)' : 'var(--accent-shield)' }}>
                      {m.lastLatencyMs !== undefined ? `${m.lastLatencyMs} ms` : '—'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      0% loss
                    </div>
                  </div>
                  <StatusBadge status={m.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cyber Defense & Incident Containment Feed */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--accent-rose)' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Active Cyber Threats & Alerts</span>
            </div>
            <button 
              onClick={() => onNavigate('security')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Manage</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {incidents.slice(0, 3).map(inc => (
              <div 
                key={inc.id}
                style={{
                  padding: '12px',
                  background: 'rgba(244, 63, 94, 0.05)',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f87171' }}>
                    {inc.title}
                  </span>
                  <StatusBadge status={inc.status} size="sm" />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inc.description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                  <span>Target: <strong style={{ color: '#fff' }}>{inc.assetName}</strong></span>
                  <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>Source: {inc.source.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Asset Infrastructure Breakdown */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Infrastructure Inventory Matrix</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Windows, Linux, VMware ESXi, and Network Appliances</div>
          </div>
          <button onClick={() => onNavigate('assets')} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            <Server size={14} />
            <span>Open Inventory</span>
          </button>
        </div>

        <table className="sg-table">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>IP Address</th>
              <th>OS / Platform</th>
              <th>Status</th>
              <th>Agent Version</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {assets.slice(0, 5).map(a => (
              <tr key={a.id}>
                <td>
                  <strong style={{ color: '#fff' }}>{a.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.hostname}</div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{a.ipAddress}</td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    background: a.osType === 'windows' ? 'rgba(59, 130, 246, 0.15)' : a.osType === 'linux' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    color: a.osType === 'windows' ? '#60a5fa' : a.osType === 'linux' ? '#fbbf24' : '#c084fc',
                    fontWeight: 600
                  }}>
                    {a.osType.toUpperCase()}
                  </span>
                </td>
                <td><StatusBadge status={a.status} size="sm" /></td>
                <td style={{ fontSize: '0.8rem', color: a.agentInstalled ? 'var(--accent-shield)' : 'var(--text-muted)' }}>
                  {a.agentInstalled ? `v${a.agentVersion}` : 'Agentless (vSphere)'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {a.tags.map(t => (
                      <span key={t} style={{ fontSize: '0.65rem', background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
