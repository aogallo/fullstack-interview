import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import quizReducer, {
  answerQuestion,
  nextQuestion,
  prevQuestion,
  resetQuiz,
} from '../quizSlice';
import uiReducer, { setView, setUsername } from '../uiSlice';
import type { QuizDetail } from '../../types';

// ---------------------------------------------------------------------------
// Helper: build a store with a specific state for testing
// ---------------------------------------------------------------------------

function createTestStore() {
  return configureStore({
    reducer: {
      quiz: quizReducer,
      score: (state = { lastResult: null, history: [], loading: false, error: null }) => state,
      ui: uiReducer,
    },
  });
}

const sampleQuiz: QuizDetail = {
  id: 'test-1',
  title: 'Test Quiz',
  description: 'A test',
  questions: [
    { id: 1, question: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'E1' },
    { id: 2, question: 'Q2', options: ['A', 'B', 'C', 'D'], correctAnswer: 1, explanation: 'E2' },
    { id: 3, question: 'Q3', options: ['A', 'B', 'C', 'D'], correctAnswer: 2, explanation: 'E3' },
  ],
};

// ---------------------------------------------------------------------------
// quizSlice tests
// ---------------------------------------------------------------------------

describe('quizSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    // Set initial quiz data
    store.dispatch({ type: 'quiz/fetchQuizById/fulfilled', payload: sampleQuiz });
  });

  describe('answerQuestion', () => {
    it('records the answer for a question', () => {
      store.dispatch(answerQuestion({ questionId: 1, optionIndex: 2 }));
      const state = store.getState().quiz;
      expect(state.answers[1]).toBe(2);
    });

    it('overwrites previous answer for same question', () => {
      store.dispatch(answerQuestion({ questionId: 1, optionIndex: 0 }));
      store.dispatch(answerQuestion({ questionId: 1, optionIndex: 3 }));
      const state = store.getState().quiz;
      expect(state.answers[1]).toBe(3);
    });

    it('stores multiple answers independently', () => {
      store.dispatch(answerQuestion({ questionId: 1, optionIndex: 0 }));
      store.dispatch(answerQuestion({ questionId: 2, optionIndex: 1 }));
      const state = store.getState().quiz;
      expect(state.answers[1]).toBe(0);
      expect(state.answers[2]).toBe(1);
    });
  });

  describe('nextQuestion', () => {
    it('advances to the next question', () => {
      store.dispatch(nextQuestion());
      const state = store.getState().quiz;
      expect(state.currentQuestionIndex).toBe(1);
    });

    it('does not advance past the last question', () => {
      store.dispatch(nextQuestion());
      store.dispatch(nextQuestion());
      store.dispatch(nextQuestion()); // past end
      const state = store.getState().quiz;
      expect(state.currentQuestionIndex).toBe(2); // last index
    });
  });

  describe('prevQuestion', () => {
    it('goes back to the previous question', () => {
      store.dispatch(nextQuestion());
      store.dispatch(prevQuestion());
      const state = store.getState().quiz;
      expect(state.currentQuestionIndex).toBe(0);
    });

    it('does not go below 0', () => {
      store.dispatch(prevQuestion());
      const state = store.getState().quiz;
      expect(state.currentQuestionIndex).toBe(0);
    });
  });

  describe('resetQuiz', () => {
    it('resets all quiz state to initial values', () => {
      store.dispatch(answerQuestion({ questionId: 1, optionIndex: 2 }));
      store.dispatch(nextQuestion());

      store.dispatch(resetQuiz());
      const state = store.getState().quiz;
      expect(state.currentQuiz).toBeNull();
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.feedback).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('async thunks', () => {
    it('sets loading on fetch pending', () => {
      store.dispatch({ type: 'quiz/fetchQuizzes/pending' });
      expect(store.getState().quiz.loading).toBe(true);
    });

    it('sets quizzes on fetch fulfilled', () => {
      const quizzes = [
        { id: 'q1', title: 'Quiz 1', description: 'Desc 1', questions: [] },
      ];
      store.dispatch({ type: 'quiz/fetchQuizzes/fulfilled', payload: quizzes });
      expect(store.getState().quiz.quizzes).toHaveLength(1);
      expect(store.getState().quiz.loading).toBe(false);
    });

    it('sets error on fetch rejected', () => {
      store.dispatch({ type: 'quiz/fetchQuizzes/rejected', payload: 'Network error' });
      expect(store.getState().quiz.error).toBe('Network error');
      expect(store.getState().quiz.loading).toBe(false);
    });

    it('resets question index and answers on fetchQuizById fulfilled', () => {
      store.dispatch(nextQuestion());
      store.dispatch(answerQuestion({ questionId: 1, optionIndex: 0 }));

      store.dispatch({ type: 'quiz/fetchQuizById/fulfilled', payload: sampleQuiz });
      const state = store.getState().quiz;
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.feedback).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// uiSlice tests
// ---------------------------------------------------------------------------

describe('uiSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('setView', () => {
    it('sets the view', () => {
      store.dispatch(setView('results'));
      expect(store.getState().ui.view).toBe('results');
    });

    it('sets view to catalog', () => {
      store.dispatch(setView('catalog'));
      expect(store.getState().ui.view).toBe('catalog');
    });
  });

  describe('setUsername', () => {
    it('sets the username', () => {
      store.dispatch(setUsername('alice'));
      expect(store.getState().ui.username).toBe('alice');
    });

    it('clears the username when null', () => {
      store.dispatch(setUsername('bob'));
      store.dispatch(setUsername(null));
      expect(store.getState().ui.username).toBeNull();
    });
  });
});
