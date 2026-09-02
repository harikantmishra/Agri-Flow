import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    procurement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Procurement",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    transactionId: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending"
    },

    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Payment", paymentSchema);