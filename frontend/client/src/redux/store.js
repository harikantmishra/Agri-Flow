import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import languageReducer from "./languageSlice";
import { api } from "./api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    language: languageReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
