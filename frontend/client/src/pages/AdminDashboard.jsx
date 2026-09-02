import {
  useGetAdminDashboardQuery
} from "../redux/api";

import {
  Link
} from "react-router-dom";

import {
  Users,
  Building2,
  CalendarCheck,
  Clock,
  Wheat,
  IndianRupee
} from "lucide-react";

export default function AdminDashboard() {

  const {
    data,
    isLoading,
    error
  } = useGetAdminDashboardQuery();

  if (isLoading) {
    return (
      <main className="p-10 text-center">
        Loading dashboard...
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-10 text-center text-red-600">
        Unable to load admin dashboard
      </main>
    );
  }

  const cards = [
    {
      title: "Total Farmers",
      value: data.totalFarmers,
      icon: <Users />
    },
    {
      title: "Procurement Centres",
      value: data.totalCentres,
      icon: <Building2 />
    },
    {
      title: "Total Bookings",
      value: data.totalBookings,
      icon: <CalendarCheck />
    },
    {
      title: "Farmers Waiting",
      value: data.waitingFarmers,
      icon: <Clock />
    },
    {
      title: "Completed Procurement",
      value: data.completedProcurement,
      icon: <Wheat />
    },
    {
      title: "Pending Payments",
      value: data.pendingPayments,
      icon: <IndianRupee />
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">

      <h2 className="text-2xl font-bold">
        प्रशासन डैशबोर्ड
      </h2>

      <p className="text-slate-500">
        Admin Dashboard
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-7">

        {cards.map((card) => (

          <div
            key={card.title}
            className="bg-white border rounded-lg p-6"
          >

            <div className="text-green-700">
              {card.icon}
            </div>

            <p className="text-sm text-slate-500 mt-4">
              {card.title}
            </p>

            <p className="text-3xl font-bold mt-1">
              {card.value}
            </p>

          </div>

        ))}

      </div>

      <Link
  to="/admin/queue"
  className="inline-block mt-7 bg-green-700 text-white px-5 py-3 rounded"
>
  Live Queue / लाइव कतार
</Link>

    </main>
  );
}