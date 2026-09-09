import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import twilio from "twilio";
import "dotenv/config";


const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

// ===============================
// FARMER REGISTRATION
// ===============================

export const register = async (req, res) => {
  try {
    const {
      name,
      mobile,
      password,
      village,
      district
    } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({
        message: "Name, mobile and password are required"
      });
    }

    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.status(409).json({
        message: "Mobile number already registered"
      });
    }

    const farmerId =
      "FRM-" +
      crypto.randomBytes(4).toString("hex").toUpperCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      mobile,
      password: hashedPassword,
      village,
      district,
      farmerId
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Registration successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        farmerId: user.farmerId,
        village: user.village,
        district: user.district,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// ===============================
// EXISTING PASSWORD LOGIN
// ===============================

export const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        message: "Mobile and password are required"
      });
    }

    const cleanMobile = mobile.replace(/\s+/g, "");

    const user = await User.findOne({
      mobile: cleanMobile
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid mobile or password"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid mobile or password"
      });
    }

    // =========================
    // ADMIN LOGIN
    // =========================

    if (user.role === "admin") {

      const token = generateToken(user._id);

      return res.json({
        message: "Login successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          farmerId: user.farmerId,
          village: user.village,
          district: user.district,
          role: user.role
        }
      });
    }

    // =========================
    // FARMER LOGIN
    // =========================

    const twilioMobile = cleanMobile.startsWith("+")
      ? cleanMobile
      : `+91${cleanMobile}`;

    await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: twilioMobile,
        channel: "sms"
      });

    return res.status(200).json({
      message: "Password verified. OTP sent successfully.",
      otpRequired: true
    });

  } catch (error) {

    console.error("Login Error:", error);

    res.status(500).json({
      message: "Login failed"
    });
  }
};

// ===============================
// SEND FARMER OTP
// ===============================

export const sendFarmerOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        message: "Mobile number is required"
      });
    }

    // Remove spaces
    const cleanMobile = mobile.replace(/\s+/g, "");

    // Check farmer exists
    const farmer = await User.findOne({
      mobile: cleanMobile,
      role: "farmer"
    });

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer is not registered with this mobile number"
      });
    }

    // Convert Indian number to E.164
    const twilioMobile = cleanMobile.startsWith("+")
      ? cleanMobile
      : `+91${cleanMobile}`;

    const verification =
      await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: twilioMobile,
          channel: "sms"
        });

    res.status(200).json({
      message: "OTP sent successfully",
      status: verification.status
    });

  } catch (error) {
    console.error("Send OTP Error:", error);

    res.status(500).json({
      message: "Failed to send OTP"
    });
  }
};


// ===============================
// VERIFY FARMER OTP
// ===============================

export const verifyLoginOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        message: "Mobile number and OTP are required"
      });
    }

    const cleanMobile = mobile.replace(/\s+/g, "");

    const twilioMobile = cleanMobile.startsWith("+")
      ? cleanMobile
      : `+91${cleanMobile}`;

    // Verify OTP with Twilio
    const verificationCheck =
      await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: twilioMobile,
          code: otp
        });

    if (verificationCheck.status !== "approved") {
      return res.status(401).json({
        message: "Invalid or expired OTP"
      });
    }

    // Find farmer
    const farmer = await User.findOne({
      mobile: cleanMobile,
      role: "farmer"
    });

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found"
      });
    }

    // Generate JWT only after OTP verification
    const token = generateToken(farmer._id);

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: farmer._id,
        name: farmer.name,
        mobile: farmer.mobile,
        farmerId: farmer.farmerId,
        village: farmer.village,
        district: farmer.district,
        role: farmer.role
      }
    });

  } catch (error) {

    console.error("Verify Login OTP Error:", error);

    res.status(500).json({
      message: "OTP verification failed"
    });
  }
};