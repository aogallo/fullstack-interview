import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Attempt, AttemptResult } from '../types';
import * as api from '../api/client';

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const submitAnswers = createAsyncThunk<
  AttemptResult,
  { quizId: string; username: string; answers: Record<number, number> }
>('score/submitAnswers', async ({ quizId, username, answers }, { rejectWithValue }) => {
  try {
    return await api.post<AttemptResult>(`/quizzes/${quizId}/submit`, { username, answers });
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

export const fetchAttempt = createAsyncThunk<AttemptResult, number>(
  'score/fetchAttempt',
  async (id, { rejectWithValue }) => {
    try {
      return await api.get<AttemptResult>(`/attempts/${id}`);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchAttemptHistory = createAsyncThunk<Attempt[], string>(
  'score/fetchAttemptHistory',
  async (username, { rejectWithValue }) => {
    try {
      return await api.get<Attempt[]>(`/users/${username}/attempts`);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface ScoreState {
  lastResult: AttemptResult | null;
  history: Attempt[];
  loading: boolean;
  error: string | null;
}

const initialState: ScoreState = {
  lastResult: null,
  history: [],
  loading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    clearLastResult(state) {
      state.lastResult = null;
    },
    clearHistory(state) {
      state.history = [];
    },
  },
  extraReducers: (builder) => {
    // submitAnswers
    builder.addCase(submitAnswers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(submitAnswers.fulfilled, (state, action) => {
      state.loading = false;
      state.lastResult = action.payload;
    });
    builder.addCase(submitAnswers.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) ?? 'Failed to submit answers';
    });

    // fetchAttempt
    builder.addCase(fetchAttempt.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAttempt.fulfilled, (state, action) => {
      state.loading = false;
      state.lastResult = action.payload;
    });
    builder.addCase(fetchAttempt.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) ?? 'Failed to fetch attempt';
    });

    // fetchAttemptHistory
    builder.addCase(fetchAttemptHistory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAttemptHistory.fulfilled, (state, action) => {
      state.loading = false;
      state.history = action.payload;
    });
    builder.addCase(fetchAttemptHistory.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) ?? 'Failed to fetch history';
    });
  },
});

export const { clearLastResult, clearHistory } = scoreSlice.actions;
export default scoreSlice.reducer;
