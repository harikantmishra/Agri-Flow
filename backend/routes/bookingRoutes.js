import express from "express";

import { protect } from "../middleware/auth.js";

import {
  createBooking,
  getMyBookings,
  getQueue
} from "../controllers/bookingController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createBooking
);

router.get(
  "/my",
  protect,
  getMyBookings
);

router.get(
  "/queue/:centreId",
  protect,
  getQueue
);

export default router;