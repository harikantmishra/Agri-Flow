import Procurement from "../models/Procurement.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

export const getMyProcurement =
  async (req, res) => {
    try {
      const records =
        await Procurement.find({
          farmer: req.user._id
        })
          .populate("booking")
          .sort({ createdAt: -1 });

      res.json(records);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };

export const createProcurement =
  async (req, res) => {
    try {
      const {
        bookingId,
        actualQuantity,
        qualityGrade,
        ratePerQuintal
      } = req.body;

      const booking =
        await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found"
        });
      }

      if (
        booking.farmer.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message: "Not authorized"
        });
      }

      const totalAmount =
        Number(actualQuantity) *
        Number(ratePerQuintal);

      const procurement =
        await Procurement.create({
          booking: booking._id,
          farmer: req.user._id,
          crop: booking.crop,
          expectedQuantity: booking.quantity,
          actualQuantity,
          qualityGrade,
          ratePerQuintal,
          totalAmount,
          status: "procured"
        });

      booking.status = "completed";
      await booking.save();

      await Payment.create({
        farmer: req.user._id,
        procurement: procurement._id,
        amount: totalAmount,
        status: "pending"
      });

      res.status(201).json({
        message:
          "Procurement recorded successfully",
        procurement
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };

export const getMyPayments =
  async (req, res) => {
    try {
      const payments =
        await Payment.find({
          farmer: req.user._id
        })
          .populate(
            "procurement",
            "crop actualQuantity totalAmount"
          )
          .sort({ createdAt: -1 });

      res.json(payments);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };

  
export const getAdminProcurement =
  async (req, res) => {
    try {

      const records =
        await Procurement.find()
          .populate(
            "farmer",
            "name mobile farmerId"
          )
          .populate(
            "booking",
            "crop quantity date slot tokenNumber"
          )
          .sort({ createdAt: -1 });

      res.json(records);

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }
  };


export const updateProcurement = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      actualQuantity,
      qualityGrade,
      ratePerQuintal,
      status
    } = req.body;

    const procurement =
      await Procurement.findById(id);

    if (!procurement) {
      return res.status(404).json({
        message: "Procurement not found"
      });
    }

    // -----------------------------
    // UPDATE VALUES
    // -----------------------------

    if (actualQuantity !== undefined) {
      procurement.actualQuantity =
        Number(actualQuantity);
    }

    if (qualityGrade !== undefined) {
      procurement.qualityGrade =
        qualityGrade;
    }

    if (ratePerQuintal !== undefined) {
      procurement.ratePerQuintal =
        Number(ratePerQuintal);
    }

    // -----------------------------
    // CALCULATE TOTAL
    // -----------------------------

    procurement.totalAmount =
      Number(procurement.actualQuantity || 0) *
      Number(procurement.ratePerQuintal || 0);


    // -----------------------------
    // STATUS
    // -----------------------------

    if (status !== undefined) {

  const allowedStatuses = [
    "pending",
    "quality_check",
    "weighing",
    "procured"
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid procurement status"
    });
  }

  procurement.status = status;

  // Sync farmer's booking progress
  const booking = await Booking.findById(
    procurement.booking
  );

  if (booking) {

    const bookingStatusMap = {
      pending: "arrived",
      quality_check: "quality_check",
      weighing: "weighing",
      procured: "completed"
    };

    booking.status =
      bookingStatusMap[status];

    await booking.save();
  }
}


    // -----------------------------
    // SAVE PROCUREMENT
    // -----------------------------

    await procurement.save();


    // -----------------------------
    // WHEN PROCURED
    // -----------------------------

    if (status === "procured") {

      // Find related booking
      const booking =
        await Booking.findById(
          procurement.booking
        );

      if (booking) {

        booking.status = "completed";

        await booking.save();
      }


      // Check whether payment already exists
      let payment =
        await Payment.findOne({
          procurement: procurement._id
        });


      // Create payment only once
      if (!payment) {

        payment = await Payment.create({

          farmer: procurement.farmer,

          procurement:
            procurement._id,

          amount:
            procurement.totalAmount,

          status: "pending"

        });

      } else {

        // Keep payment amount synchronized
        payment.amount =
          procurement.totalAmount;

        await payment.save();
      }
    }


    // -----------------------------
    // RETURN UPDATED RECORD
    // -----------------------------

    const updatedProcurement =
      await Procurement.findById(
        procurement._id
      )
        .populate(
          "farmer",
          "name mobile farmerId"
        )
        .populate(
          "booking",
          "crop quantity date slot tokenNumber status"
        );

    res.json({
      message:
        "Procurement updated successfully",

      procurement:
        updatedProcurement
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }
};