import { configureStore } from '@reduxjs/toolkit';
import quizReducer from './quizSlice';
import scoreReducer from './scoreSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    score: scoreReducer,
    ui: uiReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
