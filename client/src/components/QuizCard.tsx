import type { CSSProperties } from 'react';
import type { Quiz } from '../types';

interface QuizCardProps {
  quiz: Pick<Quiz, 'id' | 'title' | 'description'>;
  onStart: (id: string) => void;
}

const cardStyle: CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '24px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
};

const titleStyle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: '1.25rem',
};

const descStyle: CSSProperties = {
  margin: '0 0 16px',
  color: '#666',
  flex: 1,
};

const btnStyle: CSSProperties = {
  padding: '10px 24px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  alignSelf: 'flex-start',
};

export function QuizCard({ quiz, onStart }: QuizCardProps) {
  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>{quiz.title}</h3>
      <p style={descStyle}>{quiz.description}</p>
      <button style={btnStyle} onClick={() => onStart(quiz.id)}>
        Start Quiz
      </button>
    </div>
  );
}
