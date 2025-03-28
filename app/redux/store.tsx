import { configureStore } from "@reduxjs/toolkit";
import pdfReducer from "./pdfSlice";

export const store = configureStore({
  reducer: {
    pdf: pdfReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ Disables serializability checks
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
