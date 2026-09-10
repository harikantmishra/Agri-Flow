import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import AIFarmerAssistant from "../components/AIFarmerAssistant";
import { useGetMyBookingsQuery } from "../redux/api";
import {
  CalendarDays,
  CreditCard,
  Wheat,
  ArrowRight,
} from "lucide-react";

export default function Dashboard() {
  const user = useSelector(
    (state) => state.auth.user
  );

  const language = useSelector(
    (state) => state.language.current
  );

  const isHindi = language === "hi";

  const { data: bookings = [], isLoading: bookingsLoading } =
    useGetMyBookingsQuery();

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status !== "completed" &&
      booking.status !== "cancelled"
  );

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {isHindi
              ? `नमस्ते, ${user?.name || "किसान"}`
              : `Welcome, ${user?.name || "Farmer"}`}
          </h1>

          <p className="text-slate-500 mt-2">
            {isHindi
              ? "किसान खरीद पोर्टल में आपका स्वागत है"
              : "Welcome to the Farmer Procurement Portal"}
          </p>
        </div>

        {/* Farmer information */}
        <section className="bg-green-800 text-white rounded-xl p-6">

          <p className="text-green-200 text-sm">
            {isHindi
              ? "किसान आईडी"
              : "Farmer ID"}
          </p>

          <h2 className="text-2xl font-bold mt-1">
            {user?.farmerId || "AGRI-DEMO-001"}
          </h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <p className="text-green-200 text-xs">
                {isHindi ? "नाम" : "Name"}
              </p>

              <p className="font-medium">
                {user?.name || "Demo Farmer"}
              </p>
            </div>

            <div>
              <p className="text-green-200 text-xs">
                {isHindi ? "गाँव" : "Village"}
              </p>

              <p className="font-medium">
                {user?.village || "Palasia"}
              </p>
            </div>

            <div>
              <p className="text-green-200 text-xs">
                {isHindi ? "जिला" : "District"}
              </p>

              <p className="font-medium">
                {user?.district || "Indore"}
              </p>
            </div>

          </div>
        </section>

        {/* Current status */}
        <section className="bg-white border rounded-xl p-6 mt-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-sm text-slate-500">
                {isHindi
                  ? "वर्तमान खरीद स्थिति"
                  : "Current Procurement Status"}
              </p>

              {bookingsLoading ? (
                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  Loading booking...
                </h2>
              ) : activeBookings.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-3">
                  {activeBookings.map((booking) => (
                    <div key={booking._id} className="border rounded-lg p-3 w-full sm:w-[260px] flex-none min-h-[135px]">
                      <h2 className="text-lg font-bold text-slate-800">
                        {booking.crop} — Token #{booking.tokenNumber}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        {booking.centre?.name || "Procurement Centre"} · {booking.slot}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Date: {new Date(booking.date).toLocaleDateString("en-IN")}
                      </p>
                      <p className="text-sm text-green-700 mt-1 font-medium">
                        Status: {booking.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
              <>
              <h2 className="text-xl font-bold text-slate-800 mt-1">
                {isHindi
                  ? "कोई सक्रिय स्लॉट नहीं"
                  : "No Active Slot"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {isHindi
                  ? "फसल बेचने के लिए अपना स्लॉट बुक करें"
                  : "Book a slot to sell your crop"}
              </p>
              </>
              )}
            </div>

            {false && <Link
              to="/book-slot"
              className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2"
            >
              {isHindi
                ? "स्लॉट बुक करें"
                : "Book Slot"}

              <ArrowRight size={18} />
            </Link>}

          </div>

        </section>

        
        {/* AI Assistant */}
<AIFarmerAssistant isHindi={isHindi} />

        {/* Services */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">

          <ServiceCard
            icon={<CalendarDays size={26} />}
            title={
              isHindi
                ? "स्लॉट बुकिंग"
                : "Slot Booking"
            }
            description={
              isHindi
                ? "अपनी फसल बेचने के लिए समय बुक करें"
                : "Book an appointment to sell your crop"
            }
            link="/book-slot"
          />

          <ServiceCard
            icon={<Wheat size={26} />}
            title={
              isHindi
                ? "फसल खरीद"
                : "Procurement"
            }
            description={
              isHindi
                ? "अपनी फसल की खरीद स्थिति देखें"
                : "Track your crop procurement status"
            }
            link="/procurement"
          />

          <ServiceCard
            icon={<CreditCard size={26} />}
            title={
              isHindi
                ? "भुगतान"
                : "Payment"
            }
            description={
              isHindi
                ? "अपने भुगतान की स्थिति देखें"
                : "Track your payment status"
            }
            link="/payments"
          />

        </section>

        {/* Information */}
        <section className="mt-8 bg-white border rounded-xl p-6">

          <h2 className="font-bold text-lg text-slate-800">
            {isHindi
              ? "महत्वपूर्ण जानकारी"
              : "Important Information"}
          </h2>

          <div className="mt-4 space-y-3 text-sm text-slate-600">

            <p>
              •{" "}
              {isHindi
                ? "खरीद केंद्र पर जाने से पहले स्लॉट बुक करें।"
                : "Book a slot before visiting the procurement centre."}
            </p>

            <p>
              •{" "}
              {isHindi
                ? "अपने टोकन नंबर के अनुसार केंद्र पर पहुँचें।"
                : "Reach the centre according to your token number."}
            </p>

            <p>
              •{" "}
              {isHindi
                ? "भुगतान की स्थिति पोर्टल से ट्रैक करें।"
                : "Track your payment status through the portal."}
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  link,
}) {
  return (
    <Link
      to={link}
      className="bg-white border rounded-xl p-6 hover:shadow-md hover:border-green-600 transition"
    >
      <div className="text-green-700">
        {icon}
      </div>

      <h3 className="font-bold text-lg text-slate-800 mt-4">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        {description}
      </p>

      <div className="text-green-700 text-sm font-medium mt-4">
        Open →
      </div>
    </Link>
  );
}
