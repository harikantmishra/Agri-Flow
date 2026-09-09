import { Link } from "react-router-dom";
import { useGetCentresQuery } from "../redux/api";

export default function QueueSelector() {
  const { data, isLoading, isError } = useGetCentresQuery();

  const centres = Array.isArray(data)
    ? data
    : Array.isArray(data?.centres)
      ? data.centres
      : [];

  if (isLoading) {
    return <main className="p-10 text-center">Loading procurement centres...</main>;
  }

  if (isError) {
    return <main className="p-10 text-center text-red-600">Unable to load procurement centres.</main>;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800">Select a procurement centre</h1>
      <p className="text-slate-500 mt-2">Choose a centre to view its live queue.</p>

      <div className="grid gap-4 mt-6">
        {centres.length === 0 ? (
          <p className="text-slate-500">No procurement centres are available.</p>
        ) : (
          centres.map((centre) => (
            <Link
              key={centre._id || centre.id}
              to={`/queue/${centre._id || centre.id}`}
              className="bg-white border rounded-lg p-5 hover:border-green-600 hover:shadow-sm"
            >
              <h2 className="font-semibold text-slate-800">{centre.name}</h2>
              <p className="text-sm text-slate-500 mt-1">
                {centre.district || centre.location || "Procurement centre"}
              </p>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
