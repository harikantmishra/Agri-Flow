import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    mobile: {
      type: Number,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    farmerId: {
      type: String,
      unique: true,
      sparse: true
    },

    village: {
      type: String,
      default: ""
    },

    district: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["farmer", "admin", "operator"],
      default: "farmer"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);