import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Lock, 
  Terminal, 
  AlertCircle 
} from 'lucide-react';
import { AuditLog } from '../types/index.js';
import { api } from '../services/api.js';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [search, setSearch] = useState('');
  const [integrityStatus, setIntegrityStatus] = useState<{ valid: boolean; totalChecked: number } | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    try {
      setVerifying(true);
      const result = await api.verifyAuditIntegrity();
      setIntegrityStatus(result);
    } catch (err: any) {
      alert(`Integrity verification failed: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    handleVerifyIntegrity();
  }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.username.toLowerCase().includes(search.toLowerCase()) ||
    l.resourceType.toLowerCase().includes(search.toLowerCase()) ||
    l.ipAddress.includes(search)
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Tamper-Evident Audit & Compliance Log</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Cryptographically chained SHA-256 event ledger recording administrative actions, auth attempts, and automated containment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {integrityStatus && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: integrityStatus.valid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${integrityStatus.valid ? 'var(--accent-shield)' : 'var(--accent-rose)'}`,
              fontSize: '0.8rem',
              color: integrityStatus.valid ? 'var(--accent-shield)' : 'var(--accent-rose)',
              fontWeight: 700
            }}>
              <ShieldCheck size={16} />
              <span>SHA-256 Ledger Validated ({integrityStatus.totalChecked} events)</span>
            </div>
          )}

          <button onClick={handleVerifyIntegrity} disabled={verifying} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            <Lock size={14} />
            <span>{verifying ? 'Verifying...' : 'Re-verify Hash Chain'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Filter audit records by action, username, IP, or resource..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field"
          style={{ width: '100%' }}
        />
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="sg-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Operator / Actor</th>
              <th>Action</th>
              <th>Resource Type</th>
              <th>Origin IP</th>
              <th>Details</th>
              <th>SHA-256 Signature</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Loading secure audit ledger...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No audit logs matching query.
                </td>
              </tr>
            ) : (
              filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{l.username}</strong>
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      background: l.action.includes('CONTAINMENT') 
                        ? 'rgba(244, 63, 94, 0.2)' 
                        : l.action.includes('AUTH') 
                        ? 'rgba(59, 130, 246, 0.2)' 
                        : 'rgba(16, 185, 129, 0.15)',
                      color: l.action.includes('CONTAINMENT') 
                        ? '#fda4af' 
                        : l.action.includes('AUTH') 
                        ? '#93c5fd' 
                        : '#6ee7b7',
                      fontWeight: 600
                    }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{l.resourceType}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#cbd5e1' }}>{l.ipAddress}</td>
                  <td style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {JSON.stringify(l.details)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-shield)' }}>
                    {l.hashSignature.substring(0, 16)}...
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
