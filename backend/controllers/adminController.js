import User from "../models/User.js";
import Centre from "../models/Centre.js";
import Booking from "../models/Booking.js";
import Procurement from "../models/Procurement.js";
import Payment from "../models/Payment.js";

export const getAdminDashboard = async (req, res) => {
  try {

    const totalFarmers = await User.countDocuments({
      role: "farmer"
    });

    const totalCentres = await Centre.countDocuments({
      active: true
    });

   
const totalBookings =
  await Booking.countDocuments();

const waitingFarmers =
  await Booking.countDocuments({
    status: {
      $in: [
        "booked",
        "arrived",
        "quality_check",
        "weighing"
      ]
    }
  });

const completedProcurement =
  await Procurement.countDocuments({
    status: "procured"
  });

const pendingPayments =
  await Payment.countDocuments({
    status: "pending"
  });


    res.json({
      totalFarmers,
      totalCentres,
      totalBookings,
      waitingFarmers,
      completedProcurement,
      pendingPayments
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


export const getAdminQueue = async (req, res) => {
  try {

    const { centreId, date } = req.query;

    const filter = {
      status: {
        $in: [
          "booked",
          "arrived",
          "quality_check",
          "weighing"
        ]
      }
    };

    // Filter by centre
    if (centreId) {
      filter.centre = centreId;
    }

    // Filter by selected date
    if (date) {

      const selectedDate = new Date(date);

      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: start,
        $lte: end
      };
    }

    const bookings =
      await Booking.find(filter)
        .populate(
          "farmer",
          "name mobile farmerId"
        )
        .populate(
          "centre",
          "name district"
        )
        .sort({
          date: 1,
          tokenNumber: 1
        });

    res.json(bookings);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

