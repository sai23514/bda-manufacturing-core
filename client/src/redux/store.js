import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import leadReducer from './slices/leadSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
