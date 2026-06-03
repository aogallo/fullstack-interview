import type { CSSProperties } from 'react';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  showFeedback: boolean;
  onAnswer: (optionIndex: number) => void;
}

const cardStyle: CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '24px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const questionStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: '20px',
  fontSize: '1.2rem',
};

const optionsStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const feedbackStyle: CSSProperties = {
  marginTop: '16px',
  padding: '12px',
  borderRadius: '4px',
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeeba',
};

function getButtonStyle(
  index: number,
  selectedAnswer: number | null,
  showFeedback: boolean,
  correctAnswer: number,
): CSSProperties {
  const base: CSSProperties = {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: selectedAnswer !== null ? 'default' : 'pointer',
    fontSize: '1rem',
    textAlign: 'left',
    backgroundColor: '#fff',
  };

  if (!showFeedback) {
    if (index === selectedAnswer) {
      base.backgroundColor = '#e2e6ea';
    }
    return base;
  }

  if (index === correctAnswer) {
    base.backgroundColor = '#d4edda';
    base.borderColor = '#c3e6cb';
  } else if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
    base.backgroundColor = '#f8d7da';
    base.borderColor = '#f5c6cb';
  }

  return base;
}

export function QuestionCard({
  question,
  selectedAnswer,
  showFeedback,
  onAnswer,
}: QuestionCardProps) {
  return (
    <div style={cardStyle}>
      <h2 style={questionStyle}>{question.question}</h2>
      <div style={optionsStyle}>
        {question.options.map((option, index) => (
          <button
            key={index}
            style={getButtonStyle(
              index,
              selectedAnswer,
              showFeedback,
              question.correctAnswer,
            )}
            disabled={selectedAnswer !== null}
            onClick={() => onAnswer(index)}
          >
            {option}
          </button>
        ))}
      </div>
      {showFeedback && (
        <div style={feedbackStyle}>
          <p style={{ margin: 0 }}>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
