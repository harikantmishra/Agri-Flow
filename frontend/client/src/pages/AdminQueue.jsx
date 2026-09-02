
import { useState } from "react";
import {
  useGetAdminQueueQuery,
  useGetCentresQuery,
  useUpdateBookingStatusMutation,
} from "../redux/api";

export default function AdminQueue() {
  const [centreId, setCentreId] = useState("");
  const [date, setDate] = useState("");

  const { data: centres = [] } = useGetCentresQuery();

  const {
    data: bookings = [],
    isLoading,
    error,
  } = useGetAdminQueueQuery({
    centreId,
    date,
  });

  const [updateStatus, { isLoading: updating }] =
    useUpdateBookingStatusMutation();

  const changeStatus = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
    } catch (error) {
      alert(error?.data?.message || "Unable to update status");
    }
  };

  const getNextAction = (status) => {
  switch (status) {
    case "booked":
      return {
        text: "Mark Arrived",
        next: "arrived",
      };

    case "arrived":
      return {
        text: "Start Quality Check",
        next: "quality_check",
      };

    case "quality_check":
      return {
        text: "Start Weighing",
        next: "weighing",
      };

    case "weighing":
      return null;

    default:
      return null;
  }
};

  if (isLoading) {
    return (
      <main className="p-10 text-center">
        Loading queue...
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-10 text-center text-red-600">
        Unable to load queue
      </main>
    );
  }

  const clearFilters = () => {
    setCentreId("");
    setDate("");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <header>
        <h2 className="text-2xl font-bold">
          लाइव किसान कतार
        </h2>

        <p className="text-slate-500">
          Admin Queue Management
        </p>
      </header>

      {/* Filters */}
      <section className="mt-7 rounded-lg border bg-white p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Centre Filter */}
          <div>
            <label className="text-sm font-medium">
              खरीद केंद्र / Centre
            </label>

            <select
              value={centreId}
              onChange={(e) => setCentreId(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-3"
            >
              <option value="">All Centres</option>

              {centres.map((centre) => (
                <option key={centre._id} value={centre._id}>
                  {centre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-sm font-medium">
              तारीख / Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-3"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full rounded border px-5 py-3"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Queue */}
      {bookings.length === 0 ? (
        <div className="mt-7 rounded-lg border bg-white p-8 text-center">
          No farmers found.
        </div>
      ) : (
        <section className="mt-7 overflow-hidden rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4 text-left">Token</th>
                  <th className="p-4 text-left">Farmer</th>
                  <th className="p-4 text-left">Centre</th>
                  <th className="p-4 text-left">Crop</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Slot</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => {
                  const action = getNextAction(booking.status);

                  const isActive =
                    booking.status !== "completed" &&
                    booking.status !== "cancelled";

                  return (
                    <tr
                      key={booking._id}
                      className="border-t"
                    >
                      <td className="p-4 font-bold">
                        #{booking.tokenNumber}
                      </td>

                      <td className="p-4">
                        {booking.farmer?.name || "-"}
                      </td>

                      <td className="p-4">
                        {booking.centre?.name || "-"}
                      </td>

                      <td className="p-4">
                        {booking.crop}
                      </td>

                      <td className="p-4">
                        {new Date(
                          booking.date
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="p-4">
                        {booking.slot}
                      </td>

                      <td className="p-4">
                        {booking.quantity} Q
                      </td>

                      <td className="p-4">
                        <span className="rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
                          {booking.status}
                        </span>
                      </td>

                      <td className="p-4">
                        {action && (
                          <button
                            disabled={updating}
                            onClick={() =>
                              changeStatus(
                                booking._id,
                                action.next
                              )
                            }
                            className="rounded bg-green-700 px-3 py-2 text-xs text-white disabled:bg-slate-400"
                          >
                            {action.text}
                          </button>
                        )}

                        {isActive && (
                          <button
                            disabled={updating}
                            onClick={() =>
                              changeStatus(
                                booking._id,
                                "cancelled"
                              )
                            }
                            className="ml-2 rounded border border-red-300 px-3 py-2 text-xs text-red-700"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

