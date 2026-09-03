import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useDispatch
} from "react-redux";

import {
  loginSuccess
} from "../redux/authSlice";
import { API_BASE_URL } from "../config/api";

export default function Login() {

  const [form, setForm] =
    useState({
      mobile: "",
      password: ""
    });

  const [error, setError] =
    useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (e) => {

    e.preventDefault();
    setError("");

    try {

      const response =
        await fetch(
          `${API_BASE_URL}/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify(form)
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      dispatch(
  loginSuccess(data)
);

if (data.user.role === "admin") {
  navigate("/admin/dashboard");
} else {
  navigate("/dashboard");
}

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">

      <form
        onSubmit={submit}
        className="bg-white border rounded-lg p-8 w-full max-w-md"
      >

        <h2 className="text-2xl font-bold">
          किसान लॉगिन
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Farmer Login
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mt-5 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6">

          <label className="text-sm">
            Mobile Number
          </label>

          <input
            type="tel"
            required
            value={form.mobile}
            onChange={(e) =>
              setForm({
                ...form,
                mobile: e.target.value
              })
            }
            className="w-full border rounded px-3 py-3 mt-1"
            placeholder="Enter mobile number"
          />

        </div>

        <div className="mt-4">

          <label className="text-sm">
            Password
          </label>

          <input
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            className="w-full border rounded px-3 py-3 mt-1"
          />

        </div>

        <button
          className="w-full bg-green-700 text-white py-3 rounded mt-6"
        >
          Login / लॉगिन
        </button>

        <p className="text-sm text-center mt-5">
          New farmer?

          <Link
            to="/register"
            className="text-green-700 font-semibold ml-1"
          >
            Register
          </Link>
        </p>

      </form>

    </div>
  );
}
