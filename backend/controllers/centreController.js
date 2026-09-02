import Centre from "../models/Centre.js";
import Booking from "../models/Booking.js";

export const getCentres = async (req, res) => {
  try {
    const centres = await Centre.find({
      active: true
    });

    const result = await Promise.all(
      centres.map(async (centre) => {
        const today = new Date();

        const start = new Date(today);
        start.setHours(0, 0, 0, 0);

        const end = new Date(today);
        end.setHours(23, 59, 59, 999);

        const bookingCount = await Booking.countDocuments({
          centre: centre._id,
          date: {
            $gte: start,
            $lte: end
          },
          status: {
            $ne: "cancelled"
          }
        });

        return {
          ...centre.toObject(),
          todayBookings: bookingCount,
          remainingCapacity: Math.max(
            centre.dailyCapacity - bookingCount,
            0
          )
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};