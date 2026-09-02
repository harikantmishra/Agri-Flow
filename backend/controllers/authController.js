import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";

const farmerId = "FRM-" + crypto.randomBytes(4).toString("hex").toUpperCase();

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

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
    const farmerId = "FRM-" + crypto.randomBytes(4).toString("hex").toUpperCase();

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

export const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });

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

    const token = generateToken(user._id);

    res.json({
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
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};