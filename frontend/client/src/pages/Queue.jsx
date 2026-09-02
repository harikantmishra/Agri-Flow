import {
  useParams
} from "react-router-dom";

import {
  useGetQueueQuery
} from "../redux/api";

import {
  Clock,
  Users,
  Activity
} from "lucide-react";

export default function Queue() {

  const { centreId } =
    useParams();

  const {
    data,
    isLoading,
    error
  } =
    useGetQueueQuery(
      centreId,
      {
        pollingInterval: 10000
      }
    );

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        Loading queue...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        Unable to load queue
      </div>
    );
  }

  const waitTime =
    data.totalWaiting *
    data.averageProcessingMinutes;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">

      <h2 className="text-2xl font-bold">
        लाइव कतार
      </h2>

      <p className="text-slate-500">
        {data.centre.name}
      </p>

      <div className="grid md:grid-cols-3 gap-5 mt-7">

        <Card
          icon={<Activity />}
          title="Current Token"
          value={
            data.currentToken
              ? `#${data.currentToken}`
              : "-"
          }
        />

        <Card
          icon={<Users />}
          title="Farmers Waiting"
          value={data.totalWaiting}
        />

        <Card
          icon={<Clock />}
          title="Estimated Wait"
          value={`${waitTime} min`}
        />

      </div>

      <div className="bg-white border rounded-lg mt-7 overflow-hidden">

        <div className="p-5 border-b font-semibold">
          Queue Status
        </div>

        {data.queue.map(
          (item, index) => (
            <div
              key={item._id}
              className="flex justify-between p-5 border-b"
            >

              <div>
                <span className="font-bold">
                  #{item.tokenNumber}
                </span>

                <span className="ml-4 text-slate-600">
                  {item.farmer?.name}
                </span>
              </div>

              <span className="text-sm">
                {item.status}
              </span>

            </div>
          )
        )}

      </div>

    </main>
  );
}

function Card({
  icon,
  title,
  value
}) {
  return (
    <div className="bg-white border rounded-lg p-6">

      <div className="text-green-700">
        {icon}
      </div>

      <p className="text-sm text-slate-500 mt-4">
        {title}
      </p>

      <p className="text-3xl font-bold mt-1">
        {value}
      </p>

    </div>
  );
}