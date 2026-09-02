import { createSlice } from "@reduxjs/toolkit";

const savedUser =
  localStorage.getItem("agriUser");

const savedToken =
  localStorage.getItem("agriToken");

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: savedUser
      ? JSON.parse(savedUser)
      : null,

    token: savedToken || null,
  },

  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      localStorage.setItem(
        "agriUser",
        JSON.stringify(action.payload.user)
      );

      localStorage.setItem(
        "agriToken",
        action.payload.token
      );
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      localStorage.removeItem("agriUser");
      localStorage.removeItem("agriToken");
    },
  },
});

export const {
  loginSuccess,
  logout,
} = authSlice.actions;

export default authSlice.reducer;