
import {
  useGetMyPaymentsQuery
} from "../redux/api";

export default function Payments() {

  const {
    data = [],
    isLoading,
    error
  } = useGetMyPaymentsQuery();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">

      <h2 className="text-2xl font-bold">
        भुगतान स्थिति
      </h2>

      <p className="text-slate-500">
        Payment Status
      </p>

      {isLoading ? (

        <p className="mt-8">
          Loading...
        </p>

      ) : error ? (

        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-5 mt-7">
          Unable to load payment records.
        </div>

      ) : data.length === 0 ? (

        <div className="bg-white border rounded-lg p-8 mt-7 text-center">
          No payment records found.
        </div>

      ) : (

        <div className="space-y-4 mt-7">

          {data.map((payment) => (

            <div
              key={payment._id}
              className="bg-white border rounded-lg p-6"
            >

              <div className="flex justify-between items-start">

                <div>

                  <p className="font-bold text-lg">
                    {payment.procurement?.crop ||
                      "Crop"}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Procurement ID:{" "}
                    {payment.procurement?._id ||
                      "-"}
                  </p>

                  <p className="text-sm text-slate-500">
                    {payment.transactionId ||
                      "Transaction pending"}
                  </p>

                </div>

                <div className="text-right">

                  <p className="font-bold text-xl">
                    ₹{payment.amount || 0}
                  </p>

                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-semibold mt-2 ${
                      payment.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : payment.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : payment.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {payment.status || "pending"}
                  </span>

                </div>

              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-5">

                <Info
                  title="Amount"
                  value={`₹${payment.amount || 0}`}
                />

                <Info
                  title="Transaction"
                  value={
                    payment.transactionId ||
                    "Pending"
                  }
                />

                <Info
                  title="Payment Date"
                  value={
                    payment.paidAt
                      ? new Date(
                          payment.paidAt
                        ).toLocaleDateString()
                      : "Pending"
                  }
                />

              </div>


{payment.status === "paid" && (
  <button
    onClick={() =>
      window.open(
        `/payment-invoice/${payment._id}`,
        "_blank"
      )
    }
    className="mt-5 bg-green-700 text-white px-5 py-2 rounded hover:bg-green-800"
  >
    View Tax Invoice
  </button>
)}

            </div>

          ))}

        </div>

      )}

    </main>
  );
}


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

