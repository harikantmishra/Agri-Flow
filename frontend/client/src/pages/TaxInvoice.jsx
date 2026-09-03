import { useParams, useNavigate } from "react-router-dom";
import { useGetPaymentInvoiceQuery } from "../redux/api";

export default function TaxInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: invoice,
    isLoading,
    error,
  } = useGetPaymentInvoiceQuery(id);

  if (isLoading) {
    return (
      <main className="p-10 text-center">
        Loading invoice...
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg">
          Unable to load invoice.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      {/* Buttons - hidden while printing */}
      <div className="flex justify-between mb-6 print:hidden">

        <button
          onClick={() => navigate(-1)}
          className="border px-4 py-2 rounded"
        >
          ← Back
        </button>

        <button
          onClick={() => window.print()}
          className="bg-green-700 text-white px-5 py-2 rounded"
        >
          Print / Save PDF
        </button>

      </div>

      {/* INVOICE */}
      <div className="bg-white border rounded-lg p-8 shadow-sm">

        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6">

          <div>
            <h1 className="text-3xl font-bold">
              TAX INVOICE
            </h1>

            <p className="text-slate-500 mt-1">
              Procurement Payment Receipt
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500">
              Invoice Number
            </p>

            <p className="font-bold">
              {invoice.invoiceNumber}
            </p>

            <p className="text-sm text-slate-500 mt-2">
              Invoice Date
            </p>

            <p className="font-semibold">
              {formatDate(invoice.invoiceDate)}
            </p>
          </div>

        </div>

        {/* Farmer Details */}
        <section className="mt-7">

          <h2 className="font-bold text-lg mb-3">
            Farmer Details
          </h2>

          <div className="bg-slate-50 rounded-lg p-5 grid md:grid-cols-3 gap-4">

            <Info
              title="Name"
              value={invoice.farmer?.name || "-"}
            />

            <Info
              title="Farmer ID"
              value={invoice.farmer?.farmerId || "-"}
            />

            <Info
              title="Mobile"
              value={invoice.farmer?.mobile || "-"}
            />

          </div>

        </section>

        {/* Procurement Details */}
        <section className="mt-7">

          <h2 className="font-bold text-lg mb-3">
            Procurement Details
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full border-collapse">

              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-3 text-left">
                    Crop
                  </th>

                  <th className="border p-3 text-left">
                    Quantity
                  </th>

                  <th className="border p-3 text-left">
                    Quality
                  </th>

                  <th className="border p-3 text-left">
                    Rate / Quintal
                  </th>

                  <th className="border p-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>

                <tr>

                  <td className="border p-3">
                    {invoice.procurement?.crop || "-"}
                  </td>

                  <td className="border p-3">
                    {invoice.procurement?.actualQuantity ?? 0} Q
                  </td>

                  <td className="border p-3">
                    {invoice.procurement?.qualityGrade || "-"}
                  </td>

                  <td className="border p-3">
                    ₹
                    {invoice.procurement?.ratePerQuintal ?? 0}
                  </td>

                  <td className="border p-3 text-right font-semibold">
                    ₹{invoice.amount ?? 0}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>

        {/* Total */}
        <div className="flex justify-end mt-6">

          <div className="w-full md:w-80">

            <div className="flex justify-between border-b py-3">
              <span className="text-slate-500">
                Total Amount
              </span>

              <span className="font-bold text-xl">
                ₹{invoice.amount ?? 0}
              </span>
            </div>

            <div className="flex justify-between py-3">
              <span className="text-slate-500">
                Payment Status
              </span>

              <span className="font-bold text-green-700">
                PAID
              </span>
            </div>

          </div>

        </div>

        {/* Payment Details */}
        <section className="mt-7 border-t pt-6">

          <h2 className="font-bold text-lg mb-4">
            Payment Details
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <Info
              title="Transaction ID"
              value={invoice.transactionId || "-"}
            />

            <Info
              title="Payment Date"
              value={formatDate(invoice.paidAt)}
            />

            <Info
              title="Status"
              value="PAID"
            />

          </div>

        </section>

        {/* Footer */}
        <div className="border-t mt-8 pt-6 text-center">

          <p className="font-semibold">
            Payment successfully received.
          </p>

          <p className="text-sm text-slate-500 mt-1">
            This is a system-generated payment invoice.
          </p>

        </div>

      </div>

    </main>
  );
}


function Info({ title, value }) {
  return (
    <div className="bg-slate-50 rounded p-4">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="font-semibold mt-1 break-words">
        {value}
      </p>

    </div>
  );
}


function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}