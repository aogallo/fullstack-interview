import './ResultSummary.css';

interface ResultSummaryProps {
  score: number;
  total: number;
  percentage: number;
  feedback: string;
}

function getBadge(percentage: number): { label: string; color: string } {
  if (percentage >= 80) return { label: 'Excellent!', color: '#28a745' };
  if (percentage >= 50) return { label: 'Keep practicing', color: '#ffc107' };
  return { label: 'Needs review', color: '#dc3545' };
}

export function ResultSummary({ score, total, percentage, feedback }: ResultSummaryProps) {
  const badge = getBadge(percentage);

  return (
    <div className="result-summary">
      <h2 className="result-summary__title">Quiz Complete!</h2>
      <div className="result-summary__badge" style={{ backgroundColor: badge.color }}>
        {badge.label}
      </div>
      <p className="result-summary__score">
        {score}/{total} — {percentage}%
      </p>
      <p className="result-summary__feedback">{feedback}</p>
    </div>
  );
}
