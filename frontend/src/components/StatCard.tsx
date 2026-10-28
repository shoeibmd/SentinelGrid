import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = 'var(--accent-shield)',
}) => {
  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '20px', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: accentColor }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>
            {value}
          </div>
        </div>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '10px', 
          borderRadius: '10px',
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {trend && (
          <span style={{ 
            color: trend.positive ? 'var(--accent-shield)' : 'var(--accent-rose)', 
            fontWeight: 700 
          }}>
            {trend.value}
          </span>
        )}
        {subtext && <span>{subtext}</span>}
      </div>
    </div>
  );
};
