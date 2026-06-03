import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
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

// ---------------------------------------------------------------------------
// Typed hooks
// ---------------------------------------------------------------------------

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
