import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAttemptHistory } from '../store/scoreSlice';
import { setUsername } from '../store/uiSlice';

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username } = useAppSelector((state) => state.ui);
  const { history, loading, error } = useAppSelector((state) => state.score);

  useEffect(() => {
    if (username) {
      dispatch(fetchAttemptHistory(username));
    }
  }, [username, dispatch]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUsername(e.target.value || null));
  };

  const quizzesCompleted = history.length;
  const averageScore =
    quizzesCompleted > 0
      ? Math.round(history.reduce((sum, a) => sum + a.score, 0) / quizzesCompleted)
      : 0;
  const totalCorrect = history.reduce((sum, a) => sum + a.score, 0);
  const totalQuestions = history.reduce((sum, a) => sum + a.total, 0);
  const overallPercentage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const statCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const statValueStyle = {
    fontSize: '2rem',
    margin: 0,
    fontWeight: 'bold' as const,
  };

  const statLabelStyle = {
    margin: '4px 0 0',
    color: '#666',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          &larr; Back
        </button>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '24px',
        }}
      >
        <label
          style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
        >
          Username
        </label>
        <input
          type="text"
          value={username || ''}
          onChange={handleUsernameChange}
          placeholder="Enter your username"
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            width: '100%',
            maxWidth: '300px',
          }}
        />
      </div>

      {!username ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Enter a username above to see your quiz history.
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading dashboard...
        </div>
      ) : error ? (
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
      ) : quizzesCompleted === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No attempts yet. Complete a quiz to see your history here!
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div style={statCardStyle}>
              <p style={statValueStyle}>{quizzesCompleted}</p>
              <p style={statLabelStyle}>Quizzes Completed</p>
            </div>
            <div style={statCardStyle}>
              <p style={statValueStyle}>{averageScore}</p>
              <p style={statLabelStyle}>Average Score</p>
            </div>
            <div style={statCardStyle}>
              <p style={statValueStyle}>{overallPercentage}%</p>
              <p style={statLabelStyle}>Overall Accuracy</p>
            </div>
          </div>

          <h3>Attempt History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#fff',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Quiz ID</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Percentage</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((attempt, index) => (
                  <tr
                    key={attempt.id}
                    style={{ borderBottom: '1px solid #dee2e6' }}
                  >
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{attempt.quizId}</td>
                    <td style={tdStyle}>
                      {attempt.score}/{attempt.total}
                    </td>
                    <td style={tdStyle}>
                      {attempt.total > 0
                        ? Math.round((attempt.score / attempt.total) * 100)
                        : 0}
                      %
                    </td>
                    <td style={tdStyle}>
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const thStyle = {
  padding: '12px',
  textAlign: 'left' as const,
  borderBottom: '2px solid #dee2e6',
};

const tdStyle = {
  padding: '12px',
};
