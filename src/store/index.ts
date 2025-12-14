import { configureStore } from '@reduxjs/toolkit';
// Import your reducers here
// import { userReducer } from './slices/userSlice';

export const store = configureStore({
  reducer: {
    // Add your reducers here
    // user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // If using redux-persist
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;