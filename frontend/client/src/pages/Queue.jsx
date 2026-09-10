import {
  useParams,
} from "react-router-dom";

import {
  useGetQueueQuery,
  useGetMyBookingsQuery,
} from "../redux/api";

import {
  Clock,
  Users,
  Activity,
} from "lucide-react";


export default function Queue() {

  const { centreId } = useParams();

  /* =========================
     LOGGED-IN FARMER
  ========================= */


  /* =========================
     LIVE QUEUE
  ========================= */

  const {
    data,
    isLoading,
    error,
  } = useGetQueueQuery(
    centreId,
    {
      pollingInterval: 10000,
    }
  );


  /* =========================
     FARMER BOOKINGS
  ========================= */

  const {
    data: myBookings = [],
    isLoading: myBookingsLoading,
  } = useGetMyBookingsQuery();


  /* =========================
     LOADING
  ========================= */

  if (
    isLoading ||
    myBookingsLoading
  ) {
    return (
      <div className="p-10 text-center">
        Loading queue...
      </div>
    );
  }


  /* =========================
     ERROR
  ========================= */

  if (error || !data) {
    return (
      <div className="p-10 text-center text-red-600">
        Unable to load queue
      </div>
    );
  }


  /* =========================
     SAFE DATA
  ========================= */

  const queue = Array.isArray(
    data.queue
  )
    ? data.queue
    : [];


  const currentToken =
    Number(data.currentToken) || 0;


  const averageProcessingMinutes =
    Number(
      data.averageProcessingMinutes
    ) || 7;


  const totalWaiting =
    Number(data.totalWaiting) || 0;


  /* =========================
     FIND FARMER BOOKING
  ========================= */

  const myBooking =
    myBookings.find(
      (booking) => {

        const bookingCentre =
          booking.centre?._id ||
          booking.centre?.id ||
          booking.centre;

        return (
          String(bookingCentre) ===
          String(centreId)
        );
      }
    );


  /* =========================
     FARMER TOKEN
  ========================= */

  const myToken =
    Number(
      myBooking?.tokenNumber
    ) || 0;


  /* =========================
     FARMERS AHEAD
  ========================= */

const farmersAhead =
  myToken
    ? Math.max(
        myToken -
          Number(currentToken || 0) -
          1,
        0
      )
    : 0;


  /* =========================
     ESTIMATED WAIT
  ========================= */

  const estimatedWait =
    farmersAhead *
    averageProcessingMinutes;


  /* =========================
     SLOT START TIME
  ========================= */

  const getSlotStartMinutes = (
    slot
  ) => {

    if (!slot) {
      return null;
    }

    const slotStart =
      slot.split(" - ")[0];

    const parts =
      slotStart.split(" ");

    if (parts.length !== 2) {
      return null;
    }

    const time = parts[0];

    const modifier =
      parts[1].toUpperCase();

    let [hours, minutes] =
      time
        .split(":")
        .map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return null;
    }

    if (
      modifier === "PM" &&
      hours !== 12
    ) {
      hours += 12;
    }

    if (
      modifier === "AM" &&
      hours === 12
    ) {
      hours = 0;
    }

    return (
      hours * 60 +
      minutes
    );
  };


  /* =========================
     APPROXIMATE REPORTING TIME
  ========================= */

  const getApproximateTime = () => {
    // Use the value calculated by the backend when the booking was created.
    // This keeps the displayed value consistent with the booking record.
    return myBooking?.approxReportingTime || "-";
  };


  const approximateTime =
    getApproximateTime();


  return (
    <main className="max-w-5xl mx-auto px-4 py-10">

      {/* =========================
          HEADER
      ========================= */}

      <h2 className="text-2xl font-bold">
        लाइव कतार
      </h2>

      <p className="text-slate-500 mt-1">
        {data.centre?.name ||
          "Procurement Centre"}
      </p>


      {/* =========================
          FARMER STATUS
      ========================= */}

      {myBooking && (

        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-7">

          <h3 className="text-xl font-bold text-green-800">
            आपकी कतार स्थिति
          </h3>


          <div className="grid md:grid-cols-4 gap-5 mt-5">

            {/* YOUR TOKEN */}

            <div>

              <p className="text-sm text-slate-500">
                Your Token
              </p>

              <p className="text-2xl font-bold text-green-700">
                #{myToken}
              </p>

            </div>


            {/* CURRENT TOKEN */}

            <div>

              <p className="text-sm text-slate-500">
                Current Token
              </p>

              <p className="text-2xl font-bold">
                {currentToken
                  ? `#${currentToken}`
                  : "-"}
              </p>

            </div>


            {/* FARMERS AHEAD */}

            <div>

              <p className="text-sm text-slate-500">
                Farmers Ahead
              </p>

              <p className="text-2xl font-bold">
                {farmersAhead}
              </p>

            </div>


            {/* APPROX TIME */}

            <div>

              <p className="text-sm text-slate-500">
                Approx. Reporting Time
              </p>

              <p className="text-xl font-bold text-green-700">
                {approximateTime}
              </p>

            </div>

          </div>


          {/* INFORMATION */}

          <div className="mt-5 bg-white border border-green-200 rounded-lg p-4">

            <p className="text-green-800 font-medium">
              🕐 कृपया अपने अनुमानित आने के समय से
              10–15 मिनट पहले केन्द्र पर पहुंचें।
            </p>

            <p className="text-sm text-slate-500 mt-2">
              अनुमानित समय वर्तमान कतार और
              औसत processing time के आधार पर है।
              वास्तविक समय बदल सकता है।
            </p>

          </div>

        </div>

      )}


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="grid md:grid-cols-3 gap-5 mt-7">

        <Card
          icon={<Activity />}
          title="Current Token"
          value={
            currentToken
              ? `#${currentToken}`
              : "-"
          }
        />


        <Card
          icon={<Users />}
          title="Farmers Waiting"
          value={totalWaiting}
        />


        <Card
          icon={<Clock />}
          title="Your Estimated Wait"
          value={
            myBooking
              ? `${estimatedWait} min`
              : "-"
          }
        />

      </div>


      {/* =========================
          QUEUE INFORMATION
      ========================= */}

      <div className="bg-white border rounded-lg mt-7 p-5">

        <h3 className="font-semibold">
          Queue Information
        </h3>

        <p className="text-sm text-slate-500 mt-2">
          Average processing time:
          {" "}
          <strong>
            {averageProcessingMinutes}
            {" "}minutes
          </strong>
          {" "}per farmer.
        </p>

        <p className="text-sm text-slate-500 mt-1">
          Queue updates automatically
          every 10 seconds.
        </p>

      </div>


      {/* =========================
          QUEUE LIST
      ========================= */}

      <div className="bg-white border rounded-lg mt-7 overflow-hidden">

        <div className="p-5 border-b font-semibold">
          Queue Status
        </div>


        {queue.length === 0 ? (

          <div className="p-8 text-center text-slate-500">
            No farmers are currently waiting.
          </div>

        ) : (

          queue.map((item) => {

            const tokenNumber =
              Number(
                item.tokenNumber
              ) || 0;


            return (

              <div
                key={item._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b last:border-b-0"
              >

                <div>

                  <div className="flex items-center gap-3">

                    <span className="font-bold text-lg">
                      #{tokenNumber}
                    </span>

                    <span className="text-slate-600">
                      {item.farmer?.name ||
                        "Farmer"}
                    </span>

                  </div>


                  {item.slot && (

                    <p className="text-sm text-slate-500 mt-1">
                      Slot: {item.slot}
                    </p>

                  )}

                </div>


                <span className="text-sm bg-slate-100 px-3 py-1 rounded-full">
                  {item.status}
                </span>

              </div>

            );
          })

        )}

      </div>

    </main>
  );
}


/* =====================================================
   CARD
===================================================== */

function Card({
  icon,
  title,
  value,
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
