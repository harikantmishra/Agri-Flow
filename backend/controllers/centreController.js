import Centre from "../models/Centre.js";
import Booking from "../models/Booking.js";

export const getCentres = async (req, res) => {
  try {
    const centres = await Centre.find({
      active: true
    });

    const result = await Promise.all(
      centres.map(async (centre) => {
    const selectedDate = req.query.date
  ? new Date(req.query.date)
  : new Date();

const start = new Date(selectedDate);
start.setHours(0, 0, 0, 0);

const end = new Date(selectedDate);
end.setHours(23, 59, 59, 999);

        // Count today's bookings
        const todayBookings =
          await Booking.countDocuments({
            centre: centre._id,
            date: {
              $gte: start,
              $lte: end
            },
            status: {
              $ne: "cancelled"
            }
          });

        // Calculate total quantity booked today
        const bookingQuantity =
          await Booking.aggregate([
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
          bookingQuantity[0]?.totalQuantity || 0;

        return {
          ...centre.toObject(),

          // Number of farmers/bookings today
          todayBookings,

          // Total quintals booked today
          bookedQuantity,

          // Remaining quintal capacity
          remainingCapacity: Math.max(
            centre.dailyCapacity - bookedQuantity,
            0
          )
        };
      })
    );

    res.json(result);

  } catch (error) {
    console.error(
      "GET CENTRES ERROR:",
      error
    );

    res.status(500).json({
      message: error.message
    });
  }
};

export const getAdminCentres = async (req, res) => {
  try {
    const centres = await Centre.find().sort({ createdAt: -1 });

    const today = new Date();

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const result = await Promise.all(
      centres.map(async (centre) => {
       
  const todayBookings = await Booking.countDocuments({
  centre: centre._id,
  date: {
    $gte: start,
    $lte: end
  },
  status: {
    $ne: "cancelled"
  }
});

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
  quantityResult[0]?.totalQuantity || 0;

return {
  ...centre.toObject(),
  todayBookings,
  bookedQuantity,
  remainingCapacity: Math.max(
    centre.dailyCapacity - bookedQuantity,
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


export const createCentre = async (req, res) => {
  try {
    const {
      name,
      code,
      district,
      state,
      address,
      crops,
      dailyCapacity,
      averageProcessingMinutes,
      active
    } = req.body;

    if (!name || !code || !district || !address) {
      return res.status(400).json({
        message: "Name, code, district and address are required"
      });
    }

    const existingCentre = await Centre.findOne({ code });

    if (existingCentre) {
      return res.status(400).json({
        message: "Centre code already exists"
      });
    }

    const centre = await Centre.create({
      name,
      code,
      district,
      state: state || "Madhya Pradesh",
      address,
      crops: crops || [],
      dailyCapacity: dailyCapacity || 500,
      averageProcessingMinutes:
        averageProcessingMinutes || 7,
      active: active !== undefined ? active : true
    });

    res.status(201).json({
      message: "Centre created successfully",
      centre
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateCentre = async (req, res) => {
  try {
    const { id } = req.params;

    const centre = await Centre.findById(id);

    if (!centre) {
      return res.status(404).json({
        message: "Centre not found"
      });
    }

    const {
      name,
      code,
      district,
      state,
      address,
      crops,
      dailyCapacity,
      averageProcessingMinutes,
      active
    } = req.body;

    if (code && code !== centre.code) {
      const existingCentre = await Centre.findOne({ code });

      if (
        existingCentre &&
        existingCentre._id.toString() !== id
      ) {
        return res.status(400).json({
          message: "Centre code already exists"
        });
      }
    }

    if (name !== undefined) centre.name = name;
    if (code !== undefined) centre.code = code;
    if (district !== undefined) centre.district = district;
    if (state !== undefined) centre.state = state;
    if (address !== undefined) centre.address = address;
    if (crops !== undefined) centre.crops = crops;
    if (dailyCapacity !== undefined) {
      centre.dailyCapacity = Number(dailyCapacity);
    }
    if (averageProcessingMinutes !== undefined) {
      centre.averageProcessingMinutes =
        Number(averageProcessingMinutes);
    }
    if (active !== undefined) centre.active = active;

    await centre.save();

    res.json({
      message: "Centre updated successfully",
      centre
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};