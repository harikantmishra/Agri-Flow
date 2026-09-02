import mongoose from "mongoose";

const procurementSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    crop: String,

    expectedQuantity: Number,

    actualQuantity: Number,

    qualityGrade: {
      type: String,
      default: "Pending"
    },

    ratePerQuintal: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: [
        "pending",
        "quality_check",
        "weighing",
        "procured"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Procurement", procurementSchema);