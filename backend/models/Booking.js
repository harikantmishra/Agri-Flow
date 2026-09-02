import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    centre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Centre",
      required: true
    },

    crop: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    slot: {
      type: String,
      required: true
    },

    tokenNumber: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: [
        "booked",
        "arrived",
        "quality_check",
        "weighing",
        "completed",
        "cancelled"
      ],
      default: "booked"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Booking", bookingSchema);