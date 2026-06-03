import type { CSSProperties } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const wrapperStyle: CSSProperties = {
  marginBottom: '20px',
};

const labelStyle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: '0.9rem',
  color: '#666',
};

const trackStyle: CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: '#e0e0e0',
  borderRadius: '4px',
  overflow: 'hidden',
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const fillStyle: CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  };

  return (
    <div style={wrapperStyle}>
      <p style={labelStyle}>
        Question {current} of {total}
      </p>
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
    </div>
  );
}
