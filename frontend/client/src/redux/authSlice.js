import { createSlice } from "@reduxjs/toolkit";

const savedUser = localStorage.getItem("agriUser");

let user = null;

try {
  if (
    savedUser &&
    savedUser !== "undefined" &&
    savedUser !== "null"
  ) {
    user = JSON.parse(savedUser);
  }
  } catch {
  console.error("Invalid agriUser:", savedUser);

  localStorage.removeItem("agriUser");

  user = null;
}

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user,
    token: user ? "cookie" : null,
  },

  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = "cookie";

      if (action.payload.user) {
        localStorage.setItem(
          "agriUser",
          JSON.stringify(action.payload.user)
        );
      }

    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      localStorage.removeItem("agriUser");
    },
  },
});

export const {
  loginSuccess,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
