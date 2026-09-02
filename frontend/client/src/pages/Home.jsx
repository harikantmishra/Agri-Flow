import { Link } from "react-router-dom";

import {
  useSelector
} from "react-redux";

import {
  translations
} from "../i18n/translations";

import {
  CalendarDays,
  Clock3,
  CreditCard,
  Wheat
} from "lucide-react";

export default function Home() {

  const language =
    useSelector(
      (state) =>
        state.language.current
    );

  const t =
    translations[language];

  return (
    <div>

      {/* Hero */}
      <section className="bg-green-800 text-white">

        <div className="max-w-7xl mx-auto px-4 py-20">

          <div className="max-w-3xl">

            <div className="inline-block bg-white/10 px-4 py-2 rounded mb-5 text-sm">
              किसान सेवा पोर्टल
            </div>

            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              {t.farmerPortal}
            </h2>

            <p className="mt-5 text-green-100 text-lg">
              {t.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">

              <Link
                to="/register"
                className="bg-white text-green-800 px-6 py-3 rounded font-semibold"
              >
                {t.bookNow}
              </Link>

              <Link
                to="/login"
                className="border border-white px-6 py-3 rounded font-semibold"
              >
                {t.trackStatus}
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">

        <h3 className="text-2xl font-bold mb-8">
          किसान सेवाएं
        </h3>

        <div className="grid md:grid-cols-4 gap-5">

          <Feature
            icon={<CalendarDays />}
            title={t.bookSlot}
            text="अपना सुविधाजनक समय चुनें"
          />

          <Feature
            icon={<Clock3 />}
            title={t.queue}
            text="वास्तविक समय में कतार देखें"
          />

          <Feature
            icon={<Wheat />}
            title={t.procurement}
            text="फसल खरीद की स्थिति देखें"
          />

          <Feature
            icon={<CreditCard />}
            title={t.payment}
            text="भुगतान की स्थिति ट्रैक करें"
          />

        </div>

      </section>

    </div>
  );
}

function Feature({
  icon,
  title,
  text
}) {
  return (
    <div className="bg-white border rounded-lg p-6">

      <div className="text-green-700 mb-4">
        {icon}
      </div>

      <h4 className="font-bold text-lg">
        {title}
      </h4>

      <p className="text-sm text-slate-500 mt-2">
        {text}
      </p>

    </div>
  );
}