import { useState } from "react";

import {
  useGetCentresQuery,
  useCreateBookingMutation,
} from "../redux/api";

import { useNavigate } from "react-router-dom";

import {
  MapPin,
  Wheat,
  Scale,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function BookSlot() {
  const {
    data: centres = [],
    isLoading: centresLoading,
    isError: centresError,
  } = useGetCentresQuery();

  const [
    createBooking,
    {
      isLoading: bookingLoading,
    },
  ] = useCreateBookingMutation();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    centreId: "",
    crop: "",
    quantity: "",
    date: "",
    slot: "09:00 AM - 10:00 AM",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedCentre = centres.find(
    (centre) =>
      centre._id === form.centreId
  );

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
  };

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!form.centreId) {
      setMessage(
        "Please select a procurement centre."
      );
      return;
    }

    if (!form.crop) {
      setMessage(
        "Please select a crop."
      );
      return;
    }

    if (
      !form.quantity ||
      Number(form.quantity) <= 0
    ) {
      setMessage(
        "Please enter a valid quantity."
      );
      return;
    }

    if (!form.date) {
      setMessage(
        "Please select a date."
      );
      return;
    }

    try {
      const result =
        await createBooking(form).unwrap();

      setSuccess(true);

      setMessage(
        `Booking successful! Token #${
          result?.booking?.tokenNumber ||
          "Generated"
        }`
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      setMessage(
        error?.data?.message ||
        "Booking failed. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8">

      <div className="max-w-4xl mx-auto px-4">

        {/* Page Header */}

        <div className="mb-7">

          <p className="text-sm font-medium text-green-700">
            Government Procurement Service
          </p>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
            स्लॉट बुक करें / Book Procurement Slot
          </h1>

          <p className="text-slate-500 mt-2">
            Select a centre, provide crop details and
            reserve your procurement time slot.
          </p>

        </div>

        {/* Centre loading error */}

        {centresError && (
          <div className="mb-5 flex gap-3 items-start bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">

            <AlertCircle
              size={20}
              className="mt-0.5"
            />

            <div>
              <p className="font-semibold">
                Unable to load procurement centres
              </p>

              <p className="text-sm mt-1">
                Please make sure the backend server
                is running.
              </p>
            </div>

          </div>
        )}

        {/* Booking card */}

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

          {/* Centre Section */}

          <section className="p-6 border-b">

            <SectionTitle
              icon={<MapPin size={20} />}
              title="खरीद केंद्र / Procurement Centre"
              description="Select the centre where you want to sell your crop."
            />

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Procurement Centre
            </label>

            <select
              required
              value={form.centreId}
              onChange={(e) =>
                handleChange(
                  "centreId",
                  e.target.value
                )
              }
              disabled={centresLoading}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-slate-100"
            >

              <option value="">
                {centresLoading
                  ? "Loading centres..."
                  : "Select Procurement Centre / केंद्र चुनें"}
              </option>

              {centres.map((centre) => (
                <option
                  key={centre._id}
                  value={centre._id}
                >
                  {centre.name} —{" "}
                  {centre.district}{" "}
                  {centre.remainingCapacity !==
                    undefined
                    ? `(Capacity: ${centre.remainingCapacity})`
                    : ""}
                </option>
              ))}

            </select>

            {/* Selected centre information */}

            {selectedCentre && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">

                <p className="font-semibold text-green-800">
                  {selectedCentre.name}
                </p>

                <div className="grid md:grid-cols-3 gap-3 mt-3 text-sm">

                  <div>
                    <span className="text-slate-500">
                      District
                    </span>

                    <p className="font-medium">
                      {selectedCentre.district ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500">
                      Available Capacity
                    </span>

                    <p className="font-medium text-green-700">
                      {selectedCentre.remainingCapacity ??
                        "—"}{" "}
                      Quintal
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500">
                      Centre ID
                    </span>

                    <p className="font-medium">
                      {selectedCentre._id}
                    </p>
                  </div>

                </div>

              </div>
            )}

          </section>

          {/* Crop Details */}

          <section className="p-6 border-b">

            <SectionTitle
              icon={<Wheat size={20} />}
              title="फसल की जानकारी / Crop Details"
              description="Enter the crop and quantity you want to procure."
            />

            <div className="grid md:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Crop / फसल
                </label>

                <select
                  required
                  value={form.crop}
                  onChange={(e) =>
                    handleChange(
                      "crop",
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                >

                  <option value="">
                    Select Crop / फसल चुनें
                  </option>

                  <option value="Wheat">
                    Wheat / गेहूं
                  </option>

                  <option value="Rice">
                    Rice / धान
                  </option>

                  <option value="Soybean">
                    Soybean / सोयाबीन
                  </option>

                  <option value="Gram">
                    Gram / चना
                  </option>

                  <option value="Maize">
                    Maize / मक्का
                  </option>

                  <option value="Cotton">
                    Cotton / कपास
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity / मात्रा (Quintal)
                </label>

                <div className="relative">

                  <Scale
                    size={18}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />

                  <input
                    type="number"
                    min="1"
                    required
                    value={form.quantity}
                    onChange={(e) =>
                      handleChange(
                        "quantity",
                        e.target.value
                      )
                    }
                    placeholder="Example: 25"
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* Date and Time */}

          <section className="p-6">

            <SectionTitle
              icon={<CalendarDays size={20} />}
              title="तारीख और समय / Date & Time"
              description="Choose your preferred procurement date and time."
            />

            <div className="grid md:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date / तारीख
                </label>

                <input
                  type="date"
                  required
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  value={form.date}
                  onChange={(e) =>
                    handleChange(
                      "date",
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                />

              </div>

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time Slot / समय स्लॉट
                </label>

                <div className="relative">

                  <Clock
                    size={18}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />

                  <select
                    value={form.slot}
                    onChange={(e) =>
                      handleChange(
                        "slot",
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  >

                    <option>
                      09:00 AM - 10:00 AM
                    </option>

                    <option>
                      10:00 AM - 11:00 AM
                    </option>

                    <option>
                      11:00 AM - 12:00 PM
                    </option>

                    <option>
                      12:00 PM - 01:00 PM
                    </option>

                    <option>
                      02:00 PM - 03:00 PM
                    </option>

                    <option>
                      03:00 PM - 04:00 PM
                    </option>

                    <option>
                      04:00 PM - 05:00 PM
                    </option>

                  </select>

                </div>

              </div>

            </div>

          </section>

          {/* Message */}

          {message && (
            <div
              className={`mx-6 mb-6 p-4 rounded-lg flex items-center gap-3 ${
                success
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >

              {success ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}

              <span className="font-medium">
                {message}
              </span>

            </div>
          )}

          {/* Submit */}

          <div className="bg-slate-50 border-t p-6">

            <button
              type="button"
              onClick={submit}
              disabled={
                bookingLoading ||
                centresLoading
              }
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-slate-400 text-white py-3 rounded-lg font-semibold transition"
            >

              {bookingLoading
                ? "Booking... / बुकिंग हो रही है..."
                : "Confirm Booking / स्लॉट बुक करें"}

            </button>

            <p className="text-xs text-slate-500 text-center mt-3">
              A token number will be generated after
              successful booking.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-3 mb-5">

      <div className="bg-green-100 text-green-700 p-2 rounded-lg">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-800">
          {title}
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          {description}
        </p>
      </div>

    </div>
  );
}