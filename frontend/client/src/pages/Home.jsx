import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  Clock3,
  CreditCard,
  Wheat
} from "lucide-react";

import { translations } from "../i18n/translations";

export default function Home() {
  const language = useSelector(
    (state) => state.language.current
  );

  const t = translations[language];

  // Get logged-in user from Redux
  const user = useSelector((state) => state.auth.user);

  // Check if farmer is logged in
  const isFarmerLoggedIn =
    user && user.role === "farmer";

  return (
    <div>

      {/* =========================
          HERO SECTION
      ========================== */}

      <section
        className="relative bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage:
            "url('/public/images/farmer-field.jpg.png')"
        }}
      >

        {/* Green Overlay */}
        <div className="absolute inset-0 bg-green-900/65"></div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">

          <div className="max-w-3xl">

            {/* Small Badge */}
            <div className="inline-block bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg mb-5 text-sm">
              किसान सेवा पोर्टल
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {t.farmerPortal}
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-green-50 text-lg md:text-xl leading-relaxed">
              {t.subtitle}
            </p>

            {/* =========================
                BUTTONS
            ========================== */}

            <div className="flex flex-wrap gap-4 mt-8">

              {/* BOOK SLOT */}

              <Link
                to={isFarmerLoggedIn ? "/book-slot" : "/register"}
                className="bg-white text-green-800 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-green-50 transition"
              >
                {t.bookNow}
              </Link>


              {/* TRACK STATUS */}

              <Link
                to={isFarmerLoggedIn ? "/procurement" : "/login"}
                className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-800 transition"
              >
                {t.trackStatus}
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          FARMER SERVICES
      ========================== */}

      <section className="max-w-7xl mx-auto px-4 py-12">

        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          किसान सेवाएं
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">

          {/* Book Slot */}

          <Feature
            icon={<CalendarDays size={32} />}
            title={t.bookSlot}
            text="अपना सुविधाजनक समय चुनें"
          />

          {/* Queue */}

          <Feature
            icon={<Clock3 size={32} />}
            title={t.queue}
            text="वास्तविक समय में कतार देखें"
          />

          {/* Procurement */}

          <Feature
            icon={<Wheat size={32} />}
            title={t.procurement}
            text="फसल खरीद की स्थिति देखें"
          />

          {/* Payment */}

          <Feature
            icon={<CreditCard size={32} />}
            title={t.payment}
            text="भुगतान की स्थिति ट्रैक करें"
          />

        </div>

      </section>

    </div>
  );
}


/* =========================
   FEATURE CARD
========================= */

function Feature({
  icon,
  title,
  text
}) {
  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition">

      <div className="text-green-700 mb-4">
        {icon}
      </div>

      <h3 className="font-bold text-lg">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        {text}
      </p>

    </div>
  );
}