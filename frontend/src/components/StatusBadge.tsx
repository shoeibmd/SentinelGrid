import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();
  
  let bgClass = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let dotClass = 'offline';

  if (['online', 'up', 'healthy', 'resolved'].includes(normalized)) {
    bgClass = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
    dotClass = 'online';
  } else if (['warning', 'degraded', 'investigating', 'quarantined'].includes(normalized)) {
    bgClass = 'bg-amber-950/60 text-amber-300 border-amber-800/80';
    dotClass = 'warning';
  } else if (['critical', 'down', 'unreachable', 'isolated'].includes(normalized)) {
    bgClass = 'bg-rose-950/60 text-rose-300 border-rose-800/80';
    dotClass = 'critical';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '9999px',
        border: '1px solid',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
      }}
      className={bgClass}
    >
      <span className={`status-dot ${dotClass}`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
