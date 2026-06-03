import type { Quiz } from '../types';
import './QuizCard.css';

interface QuizCardProps {
  quiz: Pick<Quiz, 'id' | 'title' | 'description'>;
  onStart: (id: string) => void;
}

export function QuizCard({ quiz, onStart }: QuizCardProps) {
  return (
    <div className="quiz-card">
      <h3 className="quiz-card__title">{quiz.title}</h3>
      <p className="quiz-card__description">{quiz.description}</p>
      <button className="quiz-card__button" onClick={() => onStart(quiz.id)}>
        Start Quiz
      </button>
    </div>
  );
}
