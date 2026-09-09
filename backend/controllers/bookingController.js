
import Booking from "../models/Booking.js";
import Centre from "../models/Centre.js";
import Procurement from "../models/Procurement.js";

// helper function for calculating processing time 
const formSlotStartTime = (slot) => {
  if (!slot) return "09:00 AM";

  return slot.split(" - ")[0];
};

const addMinutesToTime = (timeString, minutesToAdd) => {
  const [time, modifier] = timeString.split(" ");

  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  const totalMinutes =
    hours * 60 + minutes + minutesToAdd;

  let finalHours =
    Math.floor(totalMinutes / 60) % 24;

  const finalMinutes = totalMinutes % 60;

  const finalModifier =
    finalHours >= 12 ? "PM" : "AM";

  if (finalHours === 0) {
    finalHours = 12;
  } else if (finalHours > 12) {
    finalHours -= 12;
  }

  return `${String(finalHours).padStart(2, "0")}:${String(
    finalMinutes
  ).padStart(2, "0")} ${finalModifier}`;
};


// ==========================================
// CREATE BOOKING
// ==========================================

// ==========================================
// CREATE BOOKING
// ==========================================

export const createBooking = async (req, res) => {
  try {
    const {
      centreId,
      crop,
      quantity,
      date,
      slot
    } = req.body;

    // Check required fields
    if (
      !centreId ||
      !crop ||
      !quantity ||
      !date ||
      !slot
    ) {
      return res.status(400).json({
        message: "All booking fields are required"
      });
    }

    // Validate quantity
    const requestedQuantity = Number(quantity);

    if (
      !Number.isFinite(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      return res.status(400).json({
        message: "Please enter a valid quantity"
      });
    }

    // Check procurement centre
    const centre = await Centre.findById(centreId);

    if (!centre || !centre.active) {
      return res.status(404).json({
        message: "Procurement centre not available"
      });
    }

    // Create start and end of selected date
    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid booking date"
      });
    }

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    // ==========================================
    // CHECK DAILY QUINTAL CAPACITY
    // ==========================================

    const quantityResult = await Booking.aggregate([
      {
        $match: {
          centre: centre._id,
          date: {
            $gte: start,
            $lte: end
          },
          status: {
            $ne: "cancelled"
          }
        }
      },
      {
        $group: {
          _id: null,
          totalQuantity: {
            $sum: "$quantity"
          }
        }
      }
    ]);

    const bookedQuantity =
      Number(quantityResult[0]?.totalQuantity || 0);

    const dailyCapacity =
      Number(centre.dailyCapacity || 0);

    const remainingCapacity =
      Math.max(
        dailyCapacity - bookedQuantity,
        0
      );

    // Reject if requested quantity exceeds capacity
    if (requestedQuantity > remainingCapacity) {
      return res.status(400).json({
        message: `Only ${remainingCapacity} Quintal capacity is available for this date`
      });
    }

    // ==========================================
    // FIND LAST TOKEN
    // ==========================================

    const lastBooking = await Booking.findOne({
      centre: centre._id,
      date: {
        $gte: start,
        $lte: end
      },
      status: {
        $ne: "cancelled"
      }
    }).sort({
      tokenNumber: -1
    });

    // Generate next token
    const tokenNumber =
      lastBooking
        ? lastBooking.tokenNumber + 1
        : 1;

        //average processing time 
       const averageProcessingMinutes = Number(
  centre.averageProcessingMinutes || 7
);

const slotStart = formSlotStartTime(slot);

const approximateMinutes =
  (tokenNumber - 1) * averageProcessingMinutes;

const approxReportingTime = addMinutesToTime(
  slotStart,
  approximateMinutes
);

    // ==========================================
    // CREATE BOOKING
    // ==========================================

    
   const booking = await Booking.create({
  farmer: req.user._id,
  centre: centre._id,
  crop,
  quantity: requestedQuantity,
  date: selectedDate,
  slot,
  tokenNumber,
  approxReportingTime,
  status: "booked"
});

    // ==========================================
    // RETURN POPULATED BOOKING
    // ==========================================

    const populatedBooking =
      await Booking.findById(booking._id)
        .populate(
          "centre",
          "name code address"
        )
        .populate(
          "farmer",
          "name farmerId mobile"
        );

    res.status(201).json({
      message: "Slot booked successfully",
      booking: populatedBooking
    });

  } catch (error) {
    console.error(
      "CREATE BOOKING ERROR:",
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// GET MY BOOKINGS
// ==========================================

export const getMyBookings = async (
  req,
  res
) => {

  try {

    const bookings =
      await Booking.find({
        farmer:
          req.user._id
      })
        .populate(
          "centre",
          "name code address"
        )
        .sort({
          date: -1
        });


    res.json(bookings);

  } catch (error) {

    res.status(500).json({
      message:
        error.message
    });

  }
};


// ==========================================
// GET LIVE QUEUE
// ==========================================

export const getQueue = async (req, res) => {
  try {
    const { centreId } = req.params;

    const centre = await Centre.findById(
      centreId
    );

    if (!centre) {
      return res.status(404).json({
        message: "Centre not found",
      });
    }

    const today = new Date();

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      centre: centreId,

      date: {
        $gte: start,
        $lte: end,
      },

      status: {
        $nin: [
          "completed",
          "cancelled",
        ],
      },
    })
      .sort({
        tokenNumber: 1,
      })
      .populate(
        "farmer",
        "name farmerId"
      );

   const currentBooking =
  bookings.find(
    (booking) =>
      booking.status === "arrived" ||
      booking.status === "quality_check" ||
      booking.status === "weighing"
  );

// If someone is currently being processed,
// use that token.
//
// If nobody has arrived yet, use the token
// immediately before the first booked farmer.
// This makes the first farmer effectively
// start from the beginning of the queue.

const currentToken = currentBooking
  ? currentBooking.tokenNumber
  : bookings.length > 0
  ? bookings[0].tokenNumber - 1
  : null;

    const waitingBookings =
      currentToken
        ? bookings.filter(
            (booking) =>
              booking.tokenNumber >
              currentToken
          )
        : bookings;

    res.json({
      centre: {
        id: centre._id,
        name: centre.name,
      },

      currentToken,

      totalWaiting:
        waitingBookings.length,

      averageProcessingMinutes:
        Number(
          centre.averageProcessingMinutes || 7
        ),

      queue: bookings,
    });

  } catch (error) {
    console.error(
      "GET QUEUE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================================
// UPDATE BOOKING STATUS - ADMIN
// ==========================================

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "booked",
      "arrived",
      "quality_check",
      "weighing",
      "completed",
      "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status"
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // -----------------------------
    // UPDATE BOOKING
    // -----------------------------

    booking.status = status;

    await booking.save();


    // -----------------------------
    // CREATE / UPDATE PROCUREMENT
    // -----------------------------

    let procurement = await Procurement.findOne({
      booking: booking._id
    });

    // Create procurement once farmer arrives
    if (
      status === "arrived" ||
      status === "quality_check" ||
      status === "weighing" 
      
    ) {

      if (!procurement) {

        procurement = await Procurement.create({
          booking: booking._id,
          farmer: booking.farmer,
          crop: booking.crop,
          expectedQuantity: booking.quantity,
          actualQuantity: 0,
          qualityGrade: "Pending",
          ratePerQuintal: 0,
          totalAmount: 0,
          status:
  status === "quality_check"
    ? "quality_check"
    : status === "weighing"
    ? "weighing"
    : "pending"
        });

      } else {

        if (status === "quality_check") {
          procurement.status = "quality_check";
        }

        if (status === "weighing") {
          procurement.status = "weighing";
        }


        await procurement.save();
      }
    }


    // -----------------------------
    // RESPONSE
    // -----------------------------

    const updatedBooking =
      await Booking.findById(id)
        .populate(
          "farmer",
          "name mobile farmerId"
        )
        .populate(
          "centre",
          "name district"
        );

    res.json({
      message: "Booking status updated",
      booking: updatedBooking,
      procurement
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
};