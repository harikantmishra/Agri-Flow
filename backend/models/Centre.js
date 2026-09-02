import mongoose from "mongoose";

const centreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    code: {
      type: String,
      required: true,
      unique: true
    },

    district: {
      type: String,
      required: true
    },

    state: {
      type: String,
      default: "Madhya Pradesh"
    },

    address: {
      type: String,
      required: true
    },

    crops: [
      {
        type: String
      }
    ],

    dailyCapacity: {
      type: Number,
      default: 500
    },

    averageProcessingMinutes: {
      type: Number,
      default: 7
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Centre", centreSchema);