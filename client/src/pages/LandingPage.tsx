import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchQuizzes } from '../store/quizSlice';
import { setView } from '../store/uiSlice';
import { QuizCard } from '../components/QuizCard';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { quizzes, loading, error } = useAppSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleStart = (quizId: string) => {
    dispatch(setView('playing'));
    navigate(`/quiz/${quizId}`);
  };

  return (
    <div>
      <div className="landing-page__hero">
        <h1 className="landing-page__title">Quiz App</h1>
        <p className="landing-page__subtitle">
          Test your knowledge with our interactive quizzes
        </p>
      </div>

      {loading && <div className="landing-page__loading">Loading quizzes...</div>}

      {error && <div className="landing-page__error">{error}</div>}

      {!loading && !error && (
        <div className="landing-page__grid">
          {quizzes.length === 0 ? (
            <p className="landing-page__empty">No quizzes available yet.</p>
          ) : (
            quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onStart={handleStart} />
            ))
          )}
        </div>
      )}

      <div className="landing-page__footer">
        <button
          className="landing-page__dashboard-btn"
          onClick={() => navigate('/dashboard')}
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}
