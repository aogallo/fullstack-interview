import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAttemptHistory } from '../store/scoreSlice';
import { setUsername } from '../store/uiSlice';
import './DashboardPage.css';

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

  return (
    <div>
      <div className="dashboard-page__header">
        <button
          className="dashboard-page__back-btn"
          onClick={() => navigate('/')}
        >
          &larr; Back
        </button>
        <h2 className="dashboard-page__title">Dashboard</h2>
      </div>

      <div className="dashboard-page__profile-card">
        <label className="dashboard-page__label">Username</label>
        <input
          className="dashboard-page__input"
          type="text"
          value={username || ''}
          onChange={handleUsernameChange}
          placeholder="Enter your username"
        />
      </div>

      {!username ? (
        <div className="dashboard-page__empty">
          Enter a username above to see your quiz history.
        </div>
      ) : loading ? (
        <div className="dashboard-page__loading">Loading dashboard...</div>
      ) : error ? (
        <div className="dashboard-page__error">{error}</div>
      ) : quizzesCompleted === 0 ? (
        <div className="dashboard-page__empty">
          No attempts yet. Complete a quiz to see your history here!
        </div>
      ) : (
        <>
          <div className="dashboard-page__stats">
            <div className="dashboard-page__stat-card">
              <p className="dashboard-page__stat-value">{quizzesCompleted}</p>
              <p className="dashboard-page__stat-label">Quizzes Completed</p>
            </div>
            <div className="dashboard-page__stat-card">
              <p className="dashboard-page__stat-value">{averageScore}</p>
              <p className="dashboard-page__stat-label">Average Score</p>
            </div>
            <div className="dashboard-page__stat-card">
              <p className="dashboard-page__stat-value">{overallPercentage}%</p>
              <p className="dashboard-page__stat-label">Overall Accuracy</p>
            </div>
          </div>

          <h3 className="dashboard-page__history-title">Attempt History</h3>
          <div className="dashboard-page__table-wrapper">
            <table className="dashboard-page__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Quiz ID</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((attempt, index) => (
                  <tr key={attempt.id}>
                    <td>{index + 1}</td>
                    <td>{attempt.quizId}</td>
                    <td>
                      {attempt.score}/{attempt.total}
                    </td>
                    <td>
                      {attempt.total > 0
                        ? Math.round((attempt.score / attempt.total) * 100)
                        : 0}
                      %
                    </td>
                    <td>
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
