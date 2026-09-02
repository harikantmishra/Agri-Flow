
import {
  useGetAdminPaymentsQuery,
  useUpdatePaymentMutation
} from "../redux/api";

export default function AdminPayments() {

  const {
    data: payments = [],
    isLoading,
    error
  } = useGetAdminPaymentsQuery();

  const [
    updatePayment,
    {
      isLoading: updating
    }
  ] = useUpdatePaymentMutation();


  const changeStatus = async (
    id,
    status
  ) => {

    try {

      await updatePayment({
        id,
        status
      }).unwrap();

    } catch (error) {

      alert(
        error?.data?.message ||
        "Unable to update payment"
      );

    }
  };


  if (isLoading) {

    return (
      <main className="p-10 text-center">
        Loading payments...
      </main>
    );

  }


  if (error) {

    return (
      <main className="p-10 text-center text-red-600">
        Unable to load payments
      </main>
    );

  }


  return (
    <main className="max-w-7xl mx-auto px-4 py-10">

      <h2 className="text-2xl font-bold">
        भुगतान प्रबंधन
      </h2>

      <p className="text-slate-500">
        Admin Payment Management
      </p>


      {payments.length === 0 ? (

        <div className="bg-white border rounded-lg p-8 mt-7 text-center">
          No payment records found.
        </div>

      ) : (

        <div className="space-y-5 mt-7">

          {payments.map((payment) => (

            <div
              key={payment._id}
              className="bg-white border rounded-lg p-6"
            >

              <div className="flex justify-between items-start">

                <div>

                  <h3 className="font-bold text-lg">
                    {payment.farmer?.name ||
                      "Farmer"}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Farmer ID:{" "}
                    {payment.farmer?.farmerId ||
                      "-"}
                  </p>

                  <p className="text-sm text-slate-500">
                    Mobile:{" "}
                    {payment.farmer?.mobile ||
                      "-"}
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    Crop:{" "}
                    {payment.procurement?.crop ||
                      "-"}
                  </p>

                </div>


                <div className="text-right">

                  <p className="text-xl font-bold">
                    ₹{payment.amount || 0}
                  </p>

                  <span className="inline-block bg-slate-100 px-3 py-1 rounded text-xs mt-2">
                    {payment.status}
                  </span>

                </div>

              </div>


              <div className="grid md:grid-cols-3 gap-4 mt-6">

                <Info
                  title="Transaction ID"
                  value={
                    payment.transactionId ||
                    "Not generated"
                  }
                />

                <Info
                  title="Created"
                  value={
                    payment.createdAt
                      ? new Date(
                          payment.createdAt
                        ).toLocaleDateString()
                      : "-"
                  }
                />

                <Info
                  title="Paid At"
                  value={
                    payment.paidAt
                      ? new Date(
                          payment.paidAt
                        ).toLocaleDateString()
                      : "Not paid"
                  }
                />

              </div>


              <div className="flex flex-wrap gap-3 mt-6">

                <button
                  onClick={() =>
                    changeStatus(
                      payment._id,
                      "pending"
                    )
                  }
                  disabled={updating}
                  className="border px-4 py-2 rounded"
                >
                  Pending
                </button>


                <button
                  onClick={() =>
                    changeStatus(
                      payment._id,
                      "processing"
                    )
                  }
                  disabled={updating}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Processing
                </button>


                <button
                  onClick={() =>
                    changeStatus(
                      payment._id,
                      "paid"
                    )
                  }
                  disabled={updating}
                  className="bg-green-700 text-white px-4 py-2 rounded"
                >
                  Mark Paid
                </button>


                <button
                  onClick={() =>
                    changeStatus(
                      payment._id,
                      "failed"
                    )
                  }
                  disabled={updating}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Failed
                </button>

              </div>

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

