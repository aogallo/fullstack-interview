import type { CSSProperties, ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({   icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state" style={emptyStateStyle}>
      <div style={iconStyle}>{icon}</div>
      {title && <h3 style={titleStyle}>{title}</h3>}
      <p style={messageStyle}>{message}</p>
      {action && <div style={actionStyle}>{action}</div>}
    </div>
  );
}

const emptyStateStyle: CSSProperties = {
  textAlign: 'center',
  padding: '48px 24px',
};

const iconStyle: CSSProperties = {
  fontSize: '3rem',
  marginBottom: '16px',
};

const titleStyle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: '1.25rem',
};

const messageStyle: CSSProperties = {
  margin: 0,
  color: '#666',
  fontSize: '1rem',
};

const actionStyle: CSSProperties = {
  marginTop: '16px',
};
