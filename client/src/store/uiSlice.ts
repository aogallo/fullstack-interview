import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppView } from '../types';

// ---------------------------------------------------------------------------
// Helpers — localStorage persistence for username
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'quiz-app-username';

function loadUsername(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveUsername(name: string | null): void {
  try {
    if (name) {
      localStorage.setItem(STORAGE_KEY, name);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Silently ignore storage errors
  }
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface UiState {
  view: AppView;
  username: string | null;
}

const initialState: UiState = {
  view: 'catalog',
  username: loadUsername(),
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setView(state, action: PayloadAction<AppView>) {
      state.view = action.payload;
    },
    setUsername(state, action: PayloadAction<string | null>) {
      state.username = action.payload;
      saveUsername(action.payload);
    },
  },
});

export const { setView, setUsername } = uiSlice.actions;
export default uiSlice.reducer;
