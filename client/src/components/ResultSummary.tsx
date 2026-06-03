import type { CSSProperties } from 'react';

interface ResultSummaryProps {
  score: number;
  total: number;
  percentage: number;
  feedback: string;
}

const cardStyle: CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '32px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

const scoreStyle: CSSProperties = {
  fontSize: '1.5rem',
  margin: '16px 0',
};

const feedbackStyle: CSSProperties = {
  color: '#666',
};

function getBadge(percentage: number): { label: string; color: string } {
  if (percentage >= 80) return { label: 'Excellent!', color: '#28a745' };
  if (percentage >= 50) return { label: 'Keep practicing', color: '#ffc107' };
  return { label: 'Needs review', color: '#dc3545' };
}

const badgeBase: CSSProperties = {
  display: 'inline-block',
  padding: '8px 24px',
  borderRadius: '20px',
  color: '#fff',
  fontWeight: 'bold',
  marginBottom: '16px',
};

export function ResultSummary({ score, total, percentage, feedback }: ResultSummaryProps) {
  const badge = getBadge(percentage);

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: '0 0 16px' }}>Quiz Complete!</h2>
      <div style={{ ...badgeBase, backgroundColor: badge.color }}>{badge.label}</div>
      <p style={scoreStyle}>
        {score}/{total} — {percentage}%
      </p>
      <p style={feedbackStyle}>{feedback}</p>
    </div>
  );
}
