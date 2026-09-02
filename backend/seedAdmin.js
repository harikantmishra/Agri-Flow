import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      mobile: 9999999999
    });

    if (existingAdmin) {

      console.log("Admin already exists");

      await mongoose.connection.close();

      return;
    }

    const hashedPassword =
      await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "System Administrator",

      mobile: 9999999999,

      password: hashedPassword,

      village: "",

      district: "",

      role: "admin"
    });

    console.log("Admin created successfully");

    console.log("Mobile:", admin.mobile);
    console.log("Password: admin123");
    console.log("Role:", admin.role);

    await mongoose.connection.close();

  } catch (error) {

    console.error(
      "Admin creation failed:",
      error.message
    );

    process.exit(1);
  }
};

createAdmin();