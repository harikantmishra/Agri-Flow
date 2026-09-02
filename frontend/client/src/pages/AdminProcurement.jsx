import { useState } from "react";

import {
  useGetAdminProcurementQuery,
  useUpdateProcurementMutation
} from "../redux/api";

export default function AdminProcurement() {

  const {
    data: records = [],
    isLoading,
    error
  } = useGetAdminProcurementQuery();

  const [
    updateProcurement,
    { isLoading: updating }
  ] = useUpdateProcurementMutation();


  const [form, setForm] = useState({});


  const handleChange = (
    id,
    field,
    value
  ) => {

    setForm((prev) => ({
      ...prev,

      [id]: {
        ...prev[id],
        [field]: value
      }
    }));

  };


  const completeProcurement = async (
    item
  ) => {

    const currentForm =
      form[item._id] || {};

    const actualQuantity =
      Number(currentForm.actualQuantity);

    const ratePerQuintal =
      Number(currentForm.ratePerQuintal);

    const qualityGrade =
      currentForm.qualityGrade;


    if (!actualQuantity || actualQuantity <= 0) {

      alert(
        "Please enter actual quantity"
      );

      return;
    }


    if (!qualityGrade) {

      alert(
        "Please select quality grade"
      );

      return;
    }


    if (!ratePerQuintal || ratePerQuintal <= 0) {

      alert(
        "Please enter rate per quintal"
      );

      return;
    }


    try {

      await updateProcurement({

        id: item._id,

        actualQuantity,

        qualityGrade,

        ratePerQuintal,

        status: "procured"

      }).unwrap();


      alert(
        "Procurement completed successfully"
      );


    } catch (error) {

      alert(
        error?.data?.message ||
        "Unable to complete procurement"
      );

    }

  };


  if (isLoading) {

    return (
      <main className="p-10 text-center">
        Loading procurement...
      </main>
    );

  }


  if (error) {

    return (
      <main className="p-10 text-center text-red-600">
        Unable to load procurement
      </main>
    );

  }


  return (

    <main className="max-w-7xl mx-auto px-4 py-10">

      <h2 className="text-2xl font-bold">
        खरीद प्रबंधन
      </h2>

      <p className="text-slate-500">
        Admin Procurement Management
      </p>


      {records.length === 0 ? (

        <div className="bg-white border rounded-lg p-8 mt-7 text-center">

          No procurement records found.

          <p className="text-sm text-slate-500 mt-2">
            Complete a booking from Admin Queue first.
          </p>

        </div>

      ) : (

        <div className="space-y-5 mt-7">

          {records.map((item) => {

            const currentForm =
              form[item._id] || {};


            const actualQuantity =
              Number(
                currentForm.actualQuantity ||
                item.actualQuantity ||
                0
              );

            const ratePerQuintal =
              Number(
                currentForm.ratePerQuintal ||
                item.ratePerQuintal ||
                0
              );

            const totalAmount =
              actualQuantity *
              ratePerQuintal;


            return (

              <div
                key={item._id}
                className="bg-white border rounded-lg p-6"
              >

                {/* FARMER */}

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="font-bold text-lg">
                      {item.farmer?.name ||
                        "Farmer"}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Farmer ID:{" "}
                      {item.farmer?.farmerId ||
                        "-"}
                    </p>

                    <p className="text-sm text-slate-500">
                      Mobile:{" "}
                      {item.farmer?.mobile ||
                        "-"}
                    </p>

                    <p className="text-sm text-slate-500 mt-2">
                      Crop:{" "}
                      {item.crop ||
                        "-"}
                    </p>

                  </div>


                  <span
                    className={
                      "px-3 py-1 rounded text-sm font-semibold " +
                      (
                        item.status === "procured"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      )
                    }
                  >
                    {item.status}
                  </span>

                </div>


                {/* DETAILS */}

                <div className="grid md:grid-cols-4 gap-4 mt-6">

                  <Info
                    title="Expected Quantity"
                    value={
                      `${item.expectedQuantity || 0} Q`
                    }
                  />


                  {/* ACTUAL QUANTITY */}

                  <div className="bg-slate-50 rounded p-4">

                    <p className="text-xs text-slate-500">
                      Actual Quantity
                    </p>

                    <input
                      type="number"
                      min="0"
                      value={
                        currentForm.actualQuantity ??
                        item.actualQuantity ??
                        ""
                      }
                      onChange={(e) =>
                        handleChange(
                          item._id,
                          "actualQuantity",
                          e.target.value
                        )
                      }
                      disabled={
                        item.status === "procured"
                      }
                      className="w-full border rounded px-3 py-2 mt-2 bg-white"
                      placeholder="Quantity"
                    />

                  </div>


                  {/* QUALITY */}

                  <div className="bg-slate-50 rounded p-4">

                    <p className="text-xs text-slate-500">
                      Quality Grade
                    </p>

                    <select
                      value={
                        currentForm.qualityGrade ??
                        (
                          item.qualityGrade === "Pending"
                            ? ""
                            : item.qualityGrade
                        )
                      }
                      onChange={(e) =>
                        handleChange(
                          item._id,
                          "qualityGrade",
                          e.target.value
                        )
                      }
                      disabled={
                        item.status === "procured"
                      }
                      className="w-full border rounded px-3 py-2 mt-2 bg-white"
                    >

                      <option value="">
                        Select Grade
                      </option>

                      <option value="A">
                        Grade A
                      </option>

                      <option value="B">
                        Grade B
                      </option>

                      <option value="C">
                        Grade C
                      </option>

                    </select>

                  </div>


                  {/* RATE */}

                  <div className="bg-slate-50 rounded p-4">

                    <p className="text-xs text-slate-500">
                      Rate / Quintal
                    </p>

                    <input
                      type="number"
                      min="0"
                      value={
                        currentForm.ratePerQuintal ??
                        item.ratePerQuintal ??
                        ""
                      }
                      onChange={(e) =>
                        handleChange(
                          item._id,
                          "ratePerQuintal",
                          e.target.value
                        )
                      }
                      disabled={
                        item.status === "procured"
                      }
                      className="w-full border rounded px-3 py-2 mt-2 bg-white"
                      placeholder="₹ / Quintal"
                    />

                  </div>

                </div>


                {/* TOTAL */}

                <div className="mt-5">

                  <div className="bg-green-50 border border-green-200 rounded-lg p-5">

                    <p className="text-sm text-slate-600">
                      Total Procurement Amount
                    </p>

                    <p className="text-2xl font-bold text-green-700 mt-1">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {actualQuantity} Q × ₹{ratePerQuintal}
                    </p>

                  </div>

                </div>


                {/* ACTION */}

                {item.status !== "procured" && (

                  <div className="mt-6">

                    <button
                      onClick={() =>
                        completeProcurement(item)
                      }
                      disabled={updating}
                      className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                    >

                      {updating
                        ? "Saving..."
                        : "Mark Procured"}

                    </button>

                  </div>

                )}


                {item.status === "procured" && (

                  <div className="mt-6 bg-green-100 text-green-800 rounded-lg p-4 font-semibold">

                    ✓ Procurement completed

                  </div>

                )}

              </div>

            );

          })}

        </div>

      )}

    </main>

  );
}


/* ---------------- INFO ---------------- */

function Info({
  title,
  value
}) {

  return (

    <div className="bg-slate-50 rounded p-4">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="font-bold mt-1">
        {value}
      </p>

    </div>

  );

}