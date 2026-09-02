import {
  useGetMyProcurementQuery
} from "../redux/api";

export default function Procurement() {

  const {
    data = [],
    isLoading,
    error
  } = useGetMyProcurementQuery();

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        Loading procurement status...
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-red-50 text-red-700 p-5 rounded-lg">
          Unable to load procurement records.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">

      <h2 className="text-2xl font-bold">
        खरीद स्थिति
      </h2>

      <p className="text-slate-500">
        Procurement Status
      </p>

      {data.length === 0 ? (

        <div className="bg-white border rounded-lg p-8 mt-7 text-center">
          No procurement records found.
        </div>

      ) : (

        <div className="space-y-5 mt-7">

          {data.map((item) => {

            // IMPORTANT:
            // Farmer progress comes from Booking status
            const bookingStatus =
              item.booking?.status || "booked";

            return (

              <div
                key={item._id}
                className="bg-white border rounded-lg p-6"
              >

                {/* HEADER */}

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="font-bold text-lg">
                      {item.crop || "Crop"}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Procurement ID: {item._id}
                    </p>

                    {item.booking?.tokenNumber && (
                      <p className="text-sm text-green-700 font-semibold mt-1">
                        Token #{item.booking.tokenNumber}
                      </p>
                    )}

                  </div>

                  <Status
                    status={bookingStatus}
                  />

                </div>


                {/* PROCUREMENT DETAILS */}

                <div className="grid md:grid-cols-4 gap-4 mt-6">

                  <Info
                    title="Expected"
                    value={
                      item.expectedQuantity != null
                        ? `${item.expectedQuantity} Q`
                        : "—"
                    }
                  />

                  <Info
                    title="Actual"
                    value={
                      item.actualQuantity != null
                        ? `${item.actualQuantity} Q`
                        : "—"
                    }
                  />

                  <Info
                    title="Quality"
                    value={
                      item.qualityGrade || "Pending"
                    }
                  />

                  <Info
                    title="Rate / Quintal"
                    value={
                      item.ratePerQuintal
                        ? `₹${item.ratePerQuintal}`
                        : "Pending"
                    }
                  />

                </div>


                <div className="mt-4">

                  <Info
                    title="Total Amount"
                    value={
                      item.totalAmount
                        ? `₹${item.totalAmount}`
                        : "Pending"
                    }
                  />

                </div>


                {/* FARMER PROGRESS */}

                <div className="mt-8">

                  <p className="text-sm font-semibold mb-5">
                    Procurement Progress
                  </p>

                  <div className="flex items-start w-full">

                    <Step
                      label="Booked"
                      active={true}
                      completed={
                        bookingStatus !== "booked"
                      }
                    />

                    <Line />

                    <Step
                      label="Arrived"
                      active={[
                        "arrived",
                        "quality_check",
                        "weighing",
                        "completed"
                      ].includes(bookingStatus)}
                    />

                    <Line />

                    <Step
                      label="Quality Check"
                      active={[
                        "quality_check",
                        "weighing",
                        "completed"
                      ].includes(bookingStatus)}
                    />

                    <Line />

                    <Step
                      label="Weighing"
                      active={[
                        "weighing",
                        "completed"
                      ].includes(bookingStatus)}
                    />

                    <Line />

                    <Step
                      label="Completed"
                      active={
                        bookingStatus === "completed"
                      }
                    />

                  </div>

                </div>

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


/* ---------------- STATUS ---------------- */

function Status({
  status
}) {

  const styles = {

    booked:
      "bg-blue-100 text-blue-800",

    arrived:
      "bg-yellow-100 text-yellow-800",

    quality_check:
      "bg-orange-100 text-orange-800",

    weighing:
      "bg-purple-100 text-purple-800",

    completed:
      "bg-green-100 text-green-800",

    cancelled:
      "bg-red-100 text-red-800"

  };

  const labels = {

    booked: "Booked",

    arrived: "Arrived",

    quality_check: "Quality Check",

    weighing: "Weighing",

    completed: "Completed",

    cancelled: "Cancelled"

  };

  return (
    <span
      className={
        "px-3 py-1 rounded text-sm font-semibold " +
        (
          styles[status] ||
          "bg-slate-100 text-slate-700"
        )
      }
    >
      {labels[status] || status}
    </span>
  );
}


/* ---------------- STEP ---------------- */

function Step({
  label,
  active
}) {

  return (
    <div className="flex flex-col items-center text-center min-w-[60px]">

      <div
        className={
          "w-5 h-5 rounded-full border-2 " +
          (
            active
              ? "bg-green-600 border-green-600"
              : "bg-slate-300 border-slate-300"
          )
        }
      />

      <span className="text-xs text-slate-500 mt-2">
        {label}
      </span>

    </div>
  );
}


/* ---------------- LINE ---------------- */

function Line() {

  return (
    <div className="flex-1 h-0.5 bg-slate-200 mt-2.5 mx-1" />
  );
}