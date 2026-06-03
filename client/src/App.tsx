import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <main
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
          }}
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
