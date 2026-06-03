import type { Question } from '../types';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  showFeedback: boolean;
  onAnswer: (optionIndex: number) => void;
}

function getOptionClass(
  index: number,
  selectedAnswer: number | null,
  showFeedback: boolean,
  correctAnswer: number,
): string {
  const classes = ['question-card__option'];

  if (!showFeedback) {
    if (index === selectedAnswer) {
      classes.push('question-card__option--selected');
    }
    return classes.join(' ');
  }

  if (index === correctAnswer) {
    classes.push('question-card__option--correct');
  } else if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
    classes.push('question-card__option--incorrect');
  }

  return classes.join(' ');
}

export function QuestionCard({
  question,
  selectedAnswer,
  showFeedback,
  onAnswer,
}: QuestionCardProps) {
  return (
    <div className="question-card">
      <h2 className="question-card__text">{question.question}</h2>
      <div className="question-card__options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={getOptionClass(
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
        <div className="question-card__feedback">
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
