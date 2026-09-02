
import Booking from "../models/Booking.js";
import Centre from "../models/Centre.js";
import Procurement from "../models/Procurement.js";


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


    // Check procurement centre
    const centre =
      await Centre.findById(centreId);

    if (!centre || !centre.active) {
      return res.status(404).json({
        message:
          "Procurement centre not available"
      });
    }


    // Create start and end of selected date
    const selectedDate =
      new Date(date);

    const start =
      new Date(selectedDate);

    start.setHours(
      0,
      0,
      0,
      0
    );

    const end =
      new Date(selectedDate);

    end.setHours(
      23,
      59,
      59,
      999
    );


    // Count active bookings
    const existingBookings =
      await Booking.countDocuments({
        centre: centreId,

        date: {
          $gte: start,
          $lte: end
        },

        status: {
          $ne: "cancelled"
        }
      });


    // Check daily capacity
    if (
      existingBookings >=
      centre.dailyCapacity
    ) {
      return res.status(400).json({
        message:
          "No capacity available for this date"
      });
    }


    // Find the last token for this
    // centre and selected date
    const lastBooking =
      await Booking.findOne({
        centre: centreId,

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


    // Create booking
    const booking =
      await Booking.create({

        farmer:
          req.user._id,

        centre:
          centreId,

        crop,

        quantity,

        date:
          selectedDate,

        slot,

        tokenNumber,

        status:
          "booked"
      });


    // Return populated booking
    const populatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "centre",
          "name code address"
        )
        .populate(
          "farmer",
          "name farmerId mobile"
        );


    res.status(201).json({

      message:
        "Slot booked successfully",

      booking:
        populatedBooking

    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message
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

export const getQueue = async (
  req,
  res
) => {

  try {

    const {
      centreId
    } = req.params;


    // Find centre
    const centre =
      await Centre.findById(
        centreId
      );

    if (!centre) {

      return res.status(404).json({
        message:
          "Centre not found"
      });

    }


    // Get active bookings
    const bookings =
      await Booking.find({

        centre:
          centreId,

        status: {
          $nin: [
            "completed",
            "cancelled"
          ]
        }

      })
        .sort({
          tokenNumber: 1
        })
        .populate(
          "farmer",
          "name farmerId"
        );


    // First booking is current token
    const currentBooking =
      bookings[0];


    // Send queue information
    res.json({

      centre: {
        id:
          centre._id,

        name:
          centre.name
      },


      currentToken:
        currentBooking
          ?.tokenNumber ||
        null,


      totalWaiting:
        Math.max(
          bookings.length - 1,
          0
        ),


      averageProcessingMinutes:
        centre.averageProcessingMinutes,


      queue:
        bookings

    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message
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
              : status === "completed"
              ? "procured"
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