import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchQuizById, answerQuestion, nextQuestion } from '../store/quizSlice';
import { submitAnswers } from '../store/scoreSlice';
import { setView } from '../store/uiSlice';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/ProgressBar';
import './QuizPage.css';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentQuiz, currentQuestionIndex, answers, loading, error } =
    useAppSelector((state) => state.quiz);
  const username = useAppSelector((state) => state.ui.username);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchQuizById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(setView('playing'));
  }, [dispatch]);

  if (loading) {
    return <div className="quiz-page__loading">Loading quiz...</div>;
  }

  if (error) {
    return <div className="quiz-page__error">{error}</div>;
  }

  if (!currentQuiz || currentQuiz.questions.length === 0) {
    return <div className="quiz-page__empty">No questions available.</div>;
  }

  const totalQuestions = currentQuiz.questions.length;
  const question = currentQuiz.questions[currentQuestionIndex];
  const selectedAnswer = question ? (answers[question.id] ?? null) : null;
  const showFeedback = selectedAnswer !== null;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null || !question) return;
    dispatch(answerQuestion({ questionId: question.id, optionIndex }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      dispatch(nextQuestion());
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await dispatch(
        submitAnswers({
          quizId: currentQuiz.id,
          username: username || 'anonymous',
          answers,
        }),
      ).unwrap();
      navigate('/results');
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />

      <QuestionCard
        question={question}
        selectedAnswer={selectedAnswer}
        showFeedback={showFeedback}
        onAnswer={handleAnswer}
      />

      {showFeedback && (
        <div className="quiz-page__actions">
          <button
            className="quiz-page__next-btn"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting
              ? 'Submitting...'
              : isLastQuestion
                ? 'See Results'
                : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
