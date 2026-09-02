import express from "express";

import {
  protect,
  adminOnly
} from "../middleware/auth.js";
import {
  updateBookingStatus
} from "../controllers/bookingController.js";

import {
  getAdminDashboard,
    getAdminQueue
      
} from "../controllers/adminController.js";

const router = express.Router();

router.get(
  "/test",
  protect,
  adminOnly,
  (req, res) => {
    res.json({
      message: "Admin access successful",
      admin: {
        id: req.user._id,
        name: req.user.name,
        mobile: req.user.mobile,
        role: req.user.role
      }
    });
  }
);
router.get(
  "/queue",
  protect,
  adminOnly,
  getAdminQueue
);
router.put(
  "/booking/:id/status",
  protect,
  adminOnly,
  updateBookingStatus
);

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getAdminDashboard
);

export default router;