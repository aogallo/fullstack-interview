import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { resetQuiz } from '../store/quizSlice';
import { setView } from '../store/uiSlice';
import { ResultSummary } from '../components/ResultSummary';

export default function ResultsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { lastResult } = useAppSelector((state) => state.score);
  const { currentQuiz, answers } = useAppSelector((state) => state.quiz);

  const [showReview, setShowReview] = useState(false);

  if (!lastResult) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No results available. Please complete a quiz first.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 24px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
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

  const btnStyle = {
    padding: '10px 24px',
    fontSize: '1rem',
    cursor: 'pointer' as const,
    border: '1px solid #007bff',
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: '#007bff',
  };

  const primaryBtnStyle = {
    ...btnStyle,
    backgroundColor: '#007bff',
    color: '#fff',
  };

  return (
    <div>
      <ResultSummary
        score={lastResult.score}
        total={lastResult.total}
        percentage={lastResult.percentage}
        feedback={`You answered ${lastResult.score} out of ${lastResult.total} questions correctly.`}
      />

      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button style={primaryBtnStyle} onClick={handleRetake}>
          Retake Quiz
        </button>
        <button style={btnStyle} onClick={handleBackToQuizzes}>
          Back to Quizzes
        </button>
        <button
          style={btnStyle}
          onClick={() => setShowReview(!showReview)}
        >
          {showReview ? 'Hide Review' : 'Review Answers'}
        </button>
      </div>

      {showReview && currentQuiz && (
        <div style={{ marginTop: '24px' }}>
          <h3>Answer Review</h3>
          {currentQuiz.questions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div
                key={q.id}
                style={{
                  padding: '16px',
                  marginBottom: '12px',
                  borderRadius: '4px',
                  border: `1px solid ${isCorrect ? '#c3e6cb' : '#f5c6cb'}`,
                  backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
                }}
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
                  <p style={{ marginTop: '8px' }}>{q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
