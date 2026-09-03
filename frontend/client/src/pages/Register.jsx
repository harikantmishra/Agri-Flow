import { useState } from "react";

import {
  useDispatch
} from "react-redux";

import {
  useNavigate
} from "react-router-dom";

import {
  loginSuccess
} from "../redux/authSlice";

export default function Register() {

  const [form, setForm] =
    useState({
      name: "",
      mobile: "",
      password: "",
      village: "",
      district: ""
    });

  const [error, setError] =
    useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const update = (field, value) => {
    setForm({
      ...form,
      [field]: value
    });
  };

  const submit = async (e) => {

    e.preventDefault();
    setError("");

    try {

      const response =
        await fetch(
          "http://localhost:5000/api/auth/register",
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

      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      <form
        onSubmit={submit}
        className="bg-white border rounded-lg p-8"
      >

        <h2 className="text-2xl font-bold">
          किसान पंजीकरण
        </h2>

        <p className="text-sm text-slate-500">
          Farmer Registration
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mt-5">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5 mt-6">

          <Input
            label="Name / नाम"
            value={form.name}
            onChange={(v) =>
              update("name", v)
            }
          />

          <Input
            label="Mobile / मोबाइल"
            value={form.mobile}
            onChange={(v) =>
              update("mobile", v)
            }
          />

          <Input
            type="password"
            label="Password / पासवर्ड"
            value={form.password}
            onChange={(v) =>
              update("password", v)
            }
          />

          <Input
            label="Village / गांव"
            value={form.village}
            onChange={(v) =>
              update("village", v)
            }
          />

          <Input
            label="District / जिला"
            value={form.district}
            onChange={(v) =>
              update("district", v)
            }
          />

        </div>

        <button
          className="w-full bg-green-700 text-white py-3 rounded mt-7"
        >
          Register / पंजीकरण करें
        </button>

      </form>

    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text"
}) {
  return (
    <div>

      <label className="text-sm">
        {label}
      </label>

      <input
        type={type}
        required
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full border rounded px-3 py-3 mt-1"
      />

    </div>
  );
}
