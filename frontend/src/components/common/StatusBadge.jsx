import React from 'react';

/**
 * Status badge for acceptance, rejection, or running state.
 */
export default function StatusBadge({ status, label, size = 'medium' }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ACCEPTED':
      case 'ACCEPT':
      case 'SUCCESS':
        return {
          background: 'rgba(34, 197, 94, 0.15)',
          color: '#22c55e',
          borderColor: 'rgba(34, 197, 94, 0.4)',
        };
      case 'REJECTED':
      case 'REJECT':
      case 'ERROR':
        return {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          borderColor: 'rgba(239, 68, 68, 0.4)',
        };
      case 'RUNNING':
        return {
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          borderColor: 'rgba(245, 158, 11, 0.4)',
        };
      case 'PAUSED':
        return {
          background: 'rgba(148, 163, 184, 0.15)',
          color: '#94a3b8',
          borderColor: 'rgba(148, 163, 184, 0.4)',
        };
      default:
        return {
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          borderColor: 'rgba(59, 130, 246, 0.4)',
        };
    }
  };

  const currentStyle = getBadgeStyle();

  const sizeClasses = {
    small: { fontSize: '0.75rem', padding: '2px 8px' },
    medium: { fontSize: '0.85rem', padding: '4px 12px' },
    large: { fontSize: '1.05rem', padding: '6px 16px', fontWeight: 700 },
  }[size] || { fontSize: '0.85rem', padding: '4px 12px' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '9999px',
        fontWeight: 600,
        border: `1px solid ${currentStyle.borderColor}`,
        backgroundColor: currentStyle.background,
        color: currentStyle.color,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        fontFamily: 'Fira Code, monospace',
        ...sizeClasses,
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: currentStyle.color,
          boxShadow: `0 0 8px ${currentStyle.color}`,
        }}
      />
      {label || status}
    </span>
  );
}
