import React, { useState } from 'react';
import { Server, Plus, Search, Filter, Trash2, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { Asset, OSType } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { api } from '../services/api.js';

interface AssetsPageProps {
  assets: Asset[];
  onRefresh: () => void;
}

export const AssetsPage: React.FC<AssetsPageProps> = ({ assets, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedOs, setSelectedOs] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Asset Form State
  const [name, setName] = useState('');
  const [hostname, setHostname] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [osType, setOsType] = useState<OSType>('linux');
  const [osVersion, setOsVersion] = useState('');
  const [groupName, setGroupName] = useState('Default');
  const [tagInput, setTagInput] = useState('');

  const filtered = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.hostname.toLowerCase().includes(search.toLowerCase()) ||
      a.ipAddress.includes(search);
    const matchesOs = selectedOs === 'all' || a.osType === selectedOs;
    return matchesSearch && matchesOs;
  });

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createAsset({
        name,
        hostname,
        ipAddress,
        osType,
        osVersion: osVersion || undefined,
        groupName: groupName || 'Default',
        tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
        status: 'online',
        agentInstalled: osType !== 'vmware_esxi' && osType !== 'network_device',
        agentVersion: '4.7.2'
      });
      setIsModalOpen(false);
      setName('');
      setHostname('');
      setIpAddress('');
      setOsVersion('');
      setTagInput('');
      onRefresh();
    } catch (err: any) {
      alert(`Error creating asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, assetName: string) => {
    if (!confirm(`Are you sure you want to remove asset ${assetName} from inventory?`)) return;
    try {
      await api.deleteAsset(id);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to delete asset: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Asset & Endpoint Inventory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Unified catalog of Windows endpoints, Linux servers, VMware ESXi hypervisors, and Network devices.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by asset name, IP, or hostname..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Platform:</span>
          {['all', 'windows', 'linux', 'vmware_esxi', 'network_device'].map(os => (
            <button
              key={os}
              onClick={() => setSelectedOs(os)}
              className={selectedOs === os ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'uppercase' }}
            >
              {os === 'vmware_esxi' ? 'ESXi' : os === 'network_device' ? 'Network' : os}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="sg-table">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>IP Address</th>
              <th>Platform / OS</th>
              <th>Group</th>
              <th>Agent Status</th>
              <th>Status</th>
              <th>Tags</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No assets found matching the criteria.
                </td>
              </tr>
            ) : (
              filtered.map(a => (
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
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{a.osVersion || 'Generic'}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{a.groupName}</td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {a.agentInstalled ? (
                      <span style={{ color: 'var(--accent-shield)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} />
                        <span>v{a.agentVersion} Active</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Managed API</span>
                    )}
                  </td>
                  <td><StatusBadge status={a.status} size="sm" /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {a.tags.map(t => (
                        <span key={t} style={{ fontSize: '0.65rem', background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(a.id, a.name)}
                      className="btn btn-outline"
                      style={{ padding: '4px 8px', color: 'var(--accent-rose)' }}
                      title="Delete Asset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add Asset */}
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
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              Enroll New Asset / Target
            </h3>

            <form onSubmit={handleCreateAsset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PROD-WEB-02"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hostname *</label>
                  <input
                    type="text"
                    required
                    placeholder="web02.corp.local"
                    value={hostname}
                    onChange={e => setHostname(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>IP Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.10.55"
                    value={ipAddress}
                    onChange={e => setIpAddress(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Operating System *</label>
                  <select
                    value={osType}
                    onChange={e => setOsType(e.target.value as OSType)}
                    className="input-field"
                    style={{ background: '#0b1324' }}
                  >
                    <option value="linux">Linux Server</option>
                    <option value="windows">Windows Server / Endpoint</option>
                    <option value="vmware_esxi">VMware ESXi Host</option>
                    <option value="network_device">Network Switch / Router</option>
                    <option value="other">Other Appliance</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OS Version</label>
                  <input
                    type="text"
                    placeholder="Ubuntu 24.04 / Server 2022"
                    value={osVersion}
                    onChange={e => setOsVersion(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Department / Group</label>
                <input
                  type="text"
                  placeholder="e.g. Production Cluster"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Web, Tier1, Nginx"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  className="input-field"
                />
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
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Enrolling...' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
