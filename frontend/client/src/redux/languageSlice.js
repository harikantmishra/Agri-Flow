import { createSlice } from "@reduxjs/toolkit";

const languageSlice = createSlice({
  name: "language",

  initialState: {
    current: "hi",
  },

  reducers: {
    toggleLanguage: (state) => {
      state.current =
        state.current === "hi" ? "en" : "hi";
    },

    setLanguage: (state, action) => {
      state.current = action.payload;
    },
  },
});

export const {
  toggleLanguage,
  setLanguage,
} = languageSlice.actions;

export default languageSlice.reducer;