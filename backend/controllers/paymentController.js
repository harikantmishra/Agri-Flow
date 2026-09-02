
import Payment from "../models/Payment.js";

export const getAdminPayments =
  async (req, res) => {
    try {

      const payments =
        await Payment.find()
          .populate(
            "farmer",
            "name mobile farmerId"
          )
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


export const updatePayment =
  async (req, res) => {
    try {

      const { id } = req.params;
      const { status } = req.body;

      const payment =
        await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found"
        });
      }

      const allowedStatuses = [
        "pending",
        "processing",
        "paid",
        "failed"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid payment status"
        });
      }

      payment.status = status;

      if (status === "paid") {

        payment.paidAt = new Date();

        payment.transactionId =
          "TXN-" +
          Date.now();

      }

      await payment.save();

      res.json({
        message: "Payment updated successfully",
        payment
      });

    } catch (error) {

    
  res.status(500).json({
        message: error.message
      });

    }
  };

