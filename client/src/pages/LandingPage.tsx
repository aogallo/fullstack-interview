import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchQuizzes } from '../store/quizSlice';
import { setView } from '../store/uiSlice';
import { QuizCard } from '../components/QuizCard';

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
      <div
        style={{
          textAlign: 'center',
          padding: '40px 0',
          marginBottom: '32px',
        }}
      >
        <h1 style={{ fontSize: '2rem', margin: '0 0 8px' }}>Quiz App</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
          Test your knowledge with our interactive quizzes
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading quizzes...
        </div>
      )}

      {error && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            border: '1px solid #f5c6cb',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {quizzes.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                gridColumn: '1 / -1',
                color: '#666',
              }}
            >
              No quizzes available yet.
            </p>
          ) : (
            quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onStart={handleStart} />
            ))
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 24px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}
