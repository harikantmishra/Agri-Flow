import express from "express";

import {
  getCentres,
  getAdminCentres,
  createCentre,
  updateCentre
} from "../controllers/centreController.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();


// Farmer / public
router.get("/", getCentres);


// Admin
router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminCentres
);

router.post(
  "/admin",
  protect,
  adminOnly,
  createCentre
);

router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateCentre
);


export default router;