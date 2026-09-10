import Booking from "../models/Booking.js";
import Procurement from "../models/Procurement.js";
import Payment from "../models/Payment.js";
import Centre from "../models/Centre.js";

/* =========================================================
   GET MY BOOKINGS
========================================================= */

export async function getMyBooking(farmerId) {
  return await Booking.find({
    farmer: farmerId,
  })
    .populate("centre", "name code address")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
}

/* =========================================================
   GET MY PROCUREMENT
========================================================= */

export async function getMyProcurement(farmerId) {
  return await Procurement.find({
    farmer: farmerId,
  })
    .populate("booking")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
}

/* =========================================================
   GET MY PAYMENTS
========================================================= */

export async function getMyPayment(farmerId) {
  return await Payment.find({
    farmer: farmerId,
  })
    .populate({
      path: "procurement",
      select:
        "crop expectedQuantity actualQuantity qualityGrade ratePerQuintal totalAmount status",
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
}

/* =========================================================
   GET MY QUEUE / ACTIVE BOOKING
========================================================= */

export async function getMyQueue(farmerId) {
  return await Booking.find({
    farmer: farmerId,
    status: {
      $in: [
        "booked",
        "arrived",
        "quality_check",
        "weighing",
      ],
    },
  })
    .populate("centre", "name code address")
    .sort({ date: 1, tokenNumber: 1 })
    .limit(10)
    .lean();
}

/* =========================================================
   GET PROCUREMENT CENTRES
========================================================= */

export async function getCentres() {
  return await Centre.find({
    active: true,
  })
    .select(
      "name code address dailyCapacity averageProcessingMinutes active"
    )
    .lean();
}

/* =========================================================
   CREATE BOOKING FOR FARMER
========================================================= */

export async function createBookingForFarmer({
  farmerId,
  centreId,
  crop,
  quantity,
  date,
  slot,
}) {
  if (!farmerId) {
    throw new Error("Farmer authentication is required");
  }

  if (!centreId || !crop || !quantity || !date || !slot) {
    throw new Error("All booking fields are required");
  }

  const requestedQuantity = Number(quantity);

  if (
    !Number.isFinite(requestedQuantity) ||
    requestedQuantity <= 0
  ) {
    throw new Error("Please enter a valid quantity");
  }

  /* -------------------------------------------------------
     FIND CENTRE
  ------------------------------------------------------- */

  const centre = await Centre.findById(centreId);

  if (!centre || !centre.active) {
    throw new Error("Procurement centre not available");
  }

  /* -------------------------------------------------------
     DATE VALIDATION
  ------------------------------------------------------- */

  const selectedDate = new Date(date);

  if (isNaN(selectedDate.getTime())) {
    throw new Error("Invalid booking date");
  }

  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(selectedDate);
  end.setHours(23, 59, 59, 999);

  /* -------------------------------------------------------
     CHECK DAILY CAPACITY
  ------------------------------------------------------- */

  const quantityResult = await Booking.aggregate([
    {
      $match: {
        centre: centre._id,
        date: {
          $gte: start,
          $lte: end,
        },
        status: {
          $ne: "cancelled",
        },
      },
    },
    {
      $group: {
        _id: null,
        totalQuantity: {
          $sum: "$quantity",
        },
      },
    },
  ]);

  const bookedQuantity = Number(
    quantityResult[0]?.totalQuantity || 0
  );

  const dailyCapacity = Number(
    centre.dailyCapacity || 0
  );

  const remainingCapacity = Math.max(
    dailyCapacity - bookedQuantity,
    0
  );

  if (requestedQuantity > remainingCapacity) {
    throw new Error(
      `Only ${remainingCapacity} Quintal capacity is available for this date`
    );
  }

  /* -------------------------------------------------------
     GENERATE TOKEN NUMBER
  ------------------------------------------------------- */

  const lastBooking = await Booking.findOne({
    centre: centre._id,
    date: {
      $gte: start,
      $lte: end,
    },
    status: {
      $ne: "cancelled",
    },
  }).sort({
    tokenNumber: -1,
  });

  const tokenNumber = lastBooking
    ? Number(lastBooking.tokenNumber) + 1
    : 1;

  /* -------------------------------------------------------
     APPROXIMATE REPORTING TIME
  ------------------------------------------------------- */

  const averageProcessingMinutes = Number(
    centre.averageProcessingMinutes || 7
  );

  const slotStart = getSlotStartTime(slot);

  const approximateMinutes =
    (tokenNumber - 1) * averageProcessingMinutes;

  const approxReportingTime = addMinutesToTime(
    slotStart,
    approximateMinutes
  );

  /* -------------------------------------------------------
     CREATE BOOKING
  ------------------------------------------------------- */

  const booking = await Booking.create({
    farmer: farmerId,
    centre: centre._id,
    crop,
    quantity: requestedQuantity,
    date: selectedDate,
    slot,
    tokenNumber,
    approxReportingTime,
    status: "booked",
  });

  /* -------------------------------------------------------
     RETURN POPULATED BOOKING
  ------------------------------------------------------- */

  return await Booking.findById(booking._id)
    .populate(
      "centre",
      "name code address"
    )
    .populate(
      "farmer",
      "name farmerId mobile"
    )
    .lean();
}

/* =========================================================
   CANCEL BOOKING
========================================================= */

export async function cancelMyBooking({
  farmerId,
  bookingId,
}) {
  if (!farmerId) {
    throw new Error("Farmer authentication is required");
  }

  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    farmer: farmerId,
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "booked") {
    throw new Error(
      "Only booked slots can be cancelled"
    );
  }

  booking.status = "cancelled";

  await booking.save();

  return booking;
}

/* =========================================================
   SLOT TIME HELPER
========================================================= */

function getSlotStartTime(slot) {
  if (!slot || typeof slot !== "string") {
    return "09:00";
  }

  /*
    Supports examples such as:

    "09:00 AM - 11:00 AM"
    "9:00 AM - 11:00 AM"
    "09:00-11:00"
    "09:00 AM"
  */

  const firstPart = slot
    .split("-")[0]
    .trim();

  /* 12-hour format */

  const match12 = firstPart.match(
    /^(\d{1,2}):?(\d{2})?\s*(AM|PM)$/i
  );

  if (match12) {
    let hours = Number(match12[1]);
    const minutes = Number(match12[2] || 0);
    const period = match12[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}`;
  }

  /* 24-hour format */

  const match24 = firstPart.match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (match24) {
    return `${String(
      Number(match24[1])
    ).padStart(2, "0")}:${match24[2]}`;
  }

  return "09:00";
}

/* =========================================================
   ADD MINUTES TO TIME
========================================================= */

function addMinutesToTime(
  time,
  minutesToAdd
) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const totalMinutes =
    hours * 60 +
    minutes +
    Number(minutesToAdd || 0);

  const finalHours =
    Math.floor(totalMinutes / 60) % 24;

  const finalMinutes =
    totalMinutes % 60;

  return `${String(finalHours).padStart(
    2,
    "0"
  )}:${String(finalMinutes).padStart(
    2,
    "0"
  )}`;
}