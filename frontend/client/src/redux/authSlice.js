import { createSlice } from "@reduxjs/toolkit";

const savedUser = localStorage.getItem("agriUser");
const savedToken = localStorage.getItem("agriToken");

let user = null;

try {
  if (
    savedUser &&
    savedUser !== "undefined" &&
    savedUser !== "null"
  ) {
    user = JSON.parse(savedUser);
  }
} catch (error) {
  console.error("Invalid agriUser:", savedUser);

  localStorage.removeItem("agriUser");

  user = null;
}

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user,
    token:
      savedToken &&
      savedToken !== "undefined" &&
      savedToken !== "null"
        ? savedToken
        : null,
  },

  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      if (action.payload.user) {
        localStorage.setItem(
          "agriUser",
          JSON.stringify(action.payload.user)
        );
      }

      if (action.payload.token) {
        localStorage.setItem(
          "agriToken",
          action.payload.token
        );
      }
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