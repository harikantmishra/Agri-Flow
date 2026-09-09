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

  const [form, setForm] = useState({
    mobile: "",
    password: ""
  });

  const [otp, setOtp] = useState("");

  const [otpStep, setOtpStep] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  // =================================
  // STEP 1: MOBILE + PASSWORD
  // =================================

  const submit = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");

    try {

      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",
            credentials: "include",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }


      // =================================
      // ADMIN LOGIN
      // =================================

      if (data.user?.role === "admin") {

        dispatch(loginSuccess(data));

        navigate("/admin/dashboard");

        return;
      }


      // =================================
      // FARMER OTP REQUIRED
      // =================================

      if (data.otpRequired) {

        setOtpStep(true);

        setMessage(
          "Password verified. OTP sent to your mobile number."
        );

        return;
      }


      // Fallback
      if (data.user) {

        dispatch(loginSuccess(data));

        navigate("/dashboard");
      }

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);
    }
  };


  // =================================
  // STEP 2: VERIFY OTP
  // =================================

  const verifyOtp = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {

      setError("Please enter the 6-digit OTP");

      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/verify-login-otp`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            mobile: form.mobile,
            otp
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message || "OTP verification failed"
        );
      }


      // Save JWT + user in Redux
      dispatch(loginSuccess(data));

      // Farmer dashboard
      navigate("/dashboard");

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);
    }
  };


  // =================================
  // CHANGE MOBILE
  // =================================

  const changeMobile = () => {

    setOtpStep(false);

    setOtp("");

    setError("");

    setMessage("");
  };


  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">

      <form
        onSubmit={otpStep ? verifyOtp : submit}
        className="bg-white border rounded-lg p-8 w-full max-w-md"
      >

        <h2 className="text-2xl font-bold">
          किसान लॉगिन
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Farmer Login
        </p>


        {/* ERROR */}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mt-5 text-sm">
            {error}
          </div>
        )}


        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded mt-5 text-sm">
            {message}
          </div>
        )}


        {/* ================================= */}
        {/* STEP 1: MOBILE + PASSWORD */}
        {/* ================================= */}

        {!otpStep && (
          <>

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
                placeholder="Enter password"
              />

            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded mt-6 hover:bg-green-800 disabled:opacity-50"
            >

              {loading
                ? "Checking..."
                : "Login / लॉगिन"}

            </button>

          </>
        )}


        {/* ================================= */}
        {/* STEP 2: OTP */}
        {/* ================================= */}

        {otpStep && (
          <>

            <div className="mt-6">

              <p className="text-sm text-slate-600">
                OTP sent to
              </p>

              <p className="font-semibold text-green-700 mt-1">
                {form.mobile}
              </p>

            </div>


            <div className="mt-5">

              <label className="text-sm">
                Enter OTP
              </label>

              <input
                type="text"
                required
                value={otp}
                maxLength={6}
                inputMode="numeric"
                autoFocus
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                className="w-full border rounded px-3 py-3 mt-1 text-center text-xl tracking-[0.5em]"
                placeholder="••••••"
              />

            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded mt-6 hover:bg-green-800 disabled:opacity-50"
            >

              {loading
                ? "Verifying..."
                : "Verify & Login / सत्यापित करें"}

            </button>


            <button
              type="button"
              onClick={changeMobile}
              className="w-full border border-green-700 text-green-700 py-3 rounded mt-3 hover:bg-green-50"
            >
              Change Mobile Number
            </button>

          </>
        )}


        {/* REGISTER */}

        {!otpStep && (
          <p className="text-sm text-center mt-5">

            New farmer?

            <Link
              to="/register"
              className="text-green-700 font-semibold ml-1"
            >
              Register
            </Link>

          </p>
        )}

      </form>

    </div>
  );
}
