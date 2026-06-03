import './ProgressBar.css';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="progress-bar">
      <p className="progress-bar__label">
        Question {current} of {total}
      </p>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
