import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Quiz, QuizDetail } from '../types';
import * as api from '../api/client';

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchQuizzes = createAsyncThunk<Quiz[]>('quiz/fetchQuizzes', async (_, { rejectWithValue }) => {
  try {
    return await api.get<Quiz[]>('/quizzes');
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

export const fetchQuizById = createAsyncThunk<QuizDetail, string>(
  'quiz/fetchQuizById',
  async (id, { rejectWithValue }) => {
    try {
      return await api.get<QuizDetail>(`/quizzes/${id}`);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface QuizState {
  quizzes: Quiz[];
  currentQuiz: QuizDetail | null;
  currentQuestionIndex: number;
  answers: Record<number, number>;
  feedback: {
    questionId: number;
    correct: boolean;
    explanation: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  currentQuestionIndex: 0,
  answers: {},
  feedback: null,
  loading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    answerQuestion(state, action: PayloadAction<{ questionId: number; optionIndex: number }>) {
      const { questionId, optionIndex } = action.payload;
      state.answers[questionId] = optionIndex;
    },
    nextQuestion(state) {
      const current = state.currentQuiz;
      if (current && state.currentQuestionIndex < current.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    prevQuestion(state) {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    resetQuiz(state) {
      state.currentQuiz = null;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.feedback = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchQuizzes
    builder.addCase(fetchQuizzes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchQuizzes.fulfilled, (state, action) => {
      state.loading = false;
      state.quizzes = action.payload;
    });
    builder.addCase(fetchQuizzes.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) ?? 'Failed to fetch quizzes';
    });

    // fetchQuizById
    builder.addCase(fetchQuizById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchQuizById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentQuiz = action.payload;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.feedback = null;
    });
    builder.addCase(fetchQuizById.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) ?? 'Failed to fetch quiz';
    });
  },
});

export const { answerQuestion, nextQuestion, prevQuestion, resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;
