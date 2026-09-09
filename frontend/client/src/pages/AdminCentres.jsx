import { useState } from "react";

import {
  useGetAdminCentresQuery,
  useCreateCentreMutation,
  useUpdateCentreMutation
} from "../redux/api";

const emptyForm = {
  name: "",
  code: "",
  district: "",
  state: "Madhya Pradesh",
  address: "",
  crops: "",
  dailyCapacity: 500,
  averageProcessingMinutes: 7,
  active: true
};

export default function AdminCentres() {
  const {
    data: centres = [],
    isLoading,
    isError
  } = useGetAdminCentresQuery();

  const [createCentre, { isLoading: creating }] =
    useCreateCentreMutation();

  const [updateCentre, { isLoading: updating }] =
    useUpdateCentreMutation();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...form,
      crops: form.crops
        .split(",")
        .map((crop) => crop.trim())
        .filter(Boolean),
      dailyCapacity: Number(form.dailyCapacity),
      averageProcessingMinutes: Number(
        form.averageProcessingMinutes
      )
    };

    try {
      if (editingId) {
        await updateCentre({
          id: editingId,
          ...data
        }).unwrap();

        alert("Centre updated successfully");
      } else {
        await createCentre(data).unwrap();

        alert("Centre created successfully");
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      alert(
        error?.data?.message ||
          "Something went wrong"
      );
    }
  };

  const handleEdit = (centre) => {
    setEditingId(centre._id);

    setForm({
      name: centre.name || "",
      code: centre.code || "",
      district: centre.district || "",
      state: centre.state || "Madhya Pradesh",
      address: centre.address || "",
      crops: centre.crops?.join(", ") || "",
      dailyCapacity: centre.dailyCapacity || 500,
      averageProcessingMinutes:
        centre.averageProcessingMinutes || 7,
      active: centre.active
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleActive = async (centre) => {
    try {
      await updateCentre({
        id: centre._id,
        active: !centre.active
      }).unwrap();

      alert(
        centre.active
          ? "Centre deactivated"
          : "Centre activated"
      );
    } catch (error) {
      alert(
        error?.data?.message ||
          "Unable to update centre"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        Loading centres...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load centres.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Centre Management
      </h1>

      {/* Add / Edit Centre */}

      <div className="bg-white shadow rounded-lg p-6 mb-8">

        <h2 className="text-xl font-semibold mb-5">
          {editingId
            ? "Edit Procurement Centre"
            : "Add Procurement Centre"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Centre Name"
            required
            className="border p-3 rounded"
          />

          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Centre Code"
            required
            className="border p-3 rounded"
          />

          <input
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="District"
            required
            className="border p-3 rounded"
          />

          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="State"
            className="border p-3 rounded"
          />

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            required
            className="border p-3 rounded md:col-span-2"
          />

          <input
            name="crops"
            value={form.crops}
            onChange={handleChange}
            placeholder="Crops (e.g. Wheat, Soybean, Rice)"
            className="border p-3 rounded md:col-span-2"
          />

          <input
            type="number"
            name="dailyCapacity"
            value={form.dailyCapacity}
            onChange={handleChange}
            placeholder="Daily Capacity"
            min="1"
            className="border p-3 rounded"
          />

          <input
            type="number"
            name="averageProcessingMinutes"
            value={form.averageProcessingMinutes}
            onChange={handleChange}
            placeholder="Average Processing Minutes"
            min="1"
            className="border p-3 rounded"
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            Centre Active
          </label>

          <div className="flex gap-3">

            <button
              type="submit"
              disabled={creating || updating}
              className="bg-green-700 text-white px-5 py-3 rounded hover:bg-green-800 disabled:opacity-50"
            >
              {creating || updating
                ? "Saving..."
                : editingId
                ? "Update Centre"
                : "Add Centre"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-5 py-3 rounded"
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </div>


      {/* Centre List */}

      <div className="bg-white shadow rounded-lg overflow-hidden">

        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">
            Procurement Centres
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">
                  Name
                </th>

                <th className="p-3 text-left">
                  Code
                </th>

                <th className="p-3 text-left">
                  District
                </th>

                <th className="p-3 text-left">
                  Crops
                </th>
<th className="p-3 text-left">
  Capacity
</th>

<th className="p-3 text-left">
  Today's Bookings
</th>

<th className="p-3 text-left">
  Remaining
</th>

                <th className="p-3 text-left">
                  Status
                </th>

                <th className="p-3 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {centres.map((centre) => (
                <tr
                  key={centre._id}
                  className="border-t"
                >

                  <td className="p-3">
                    {centre.name}
                  </td>

                  <td className="p-3 font-medium">
                    {centre.code}
                  </td>

                  <td className="p-3">
                    {centre.district}
                  </td>

                  <td className="p-3">
                    {centre.crops?.join(", ") || "-"}
                  </td>
<td className="p-3">
  {centre.dailyCapacity}
</td>

<td className="p-3">
  {centre.todayBookings}
</td>

<td className="p-3 font-semibold">
  {centre.remainingCapacity}
</td>
                  <td className="p-3">
                    <span
                      className={
                        centre.active
                          ? "text-green-700 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {centre.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          handleEdit(centre)
                        }
                        className="bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          toggleActive(centre)
                        }
                        className={
                          centre.active
                            ? "bg-red-600 text-white px-3 py-2 rounded"
                            : "bg-green-600 text-white px-3 py-2 rounded"
                        }
                      >
                        {centre.active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                    </div>

                  </td>

                </tr>
              ))}

              {centres.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="p-6 text-center text-gray-500"
                  >
                    No procurement centres found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}