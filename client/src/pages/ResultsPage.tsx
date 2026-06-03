import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { resetQuiz } from '../store/quizSlice';
import { setView } from '../store/uiSlice';
import { ResultSummary } from '../components/ResultSummary';
import './ResultsPage.css';

export default function ResultsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { lastResult } = useAppSelector((state) => state.score);
  const { currentQuiz, answers } = useAppSelector((state) => state.quiz);

  const [showReview, setShowReview] = useState(false);

  if (!lastResult) {
    return (
      <div className="results-page__empty">
        <p>No results available. Please complete a quiz first.</p>
        <button className="results-page__back-btn" onClick={() => navigate('/')}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  const handleRetake = () => {
    if (!currentQuiz) return;
    dispatch(resetQuiz());
    navigate(`/quiz/${currentQuiz.id}`);
  };

  const handleBackToQuizzes = () => {
    dispatch(setView('catalog'));
    navigate('/');
  };

  return (
    <div>
      <ResultSummary
        score={lastResult.score}
        total={lastResult.total}
        percentage={lastResult.percentage}
        feedback={`You answered ${lastResult.score} out of ${lastResult.total} questions correctly.`}
      />

      <div className="results-page__actions">
        <button
          className="results-page__action-btn results-page__action-btn--primary"
          onClick={handleRetake}
        >
          Retake Quiz
        </button>
        <button className="results-page__action-btn" onClick={handleBackToQuizzes}>
          Back to Quizzes
        </button>
        <button
          className="results-page__action-btn"
          onClick={() => setShowReview(!showReview)}
        >
          {showReview ? 'Hide Review' : 'Review Answers'}
        </button>
      </div>

      {showReview && currentQuiz && (
        <div className="results-page__review">
          <h3 className="results-page__review-title">Answer Review</h3>
          {currentQuiz.questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div
                key={q.id}
                className={
                  isCorrect
                    ? 'results-page__review-item results-page__review-item--correct'
                    : 'results-page__review-item results-page__review-item--incorrect'
                }
              >
                <p>
                  <strong>Q{index + 1}:</strong> {q.question}
                </p>
                <p>
                  Your answer:{' '}
                  {userAnswer !== undefined
                    ? q.options[userAnswer]
                    : 'Not answered'}
                </p>
                <p>Correct answer: {q.options[q.correctAnswer]}</p>
                {!isCorrect && (
                  <p className="results-page__review-explanation">
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
