import express from "express";



import {
  protect,
  adminOnly
} from "../middleware/auth.js";

import {
  getMyProcurement,
  createProcurement,
  getMyPayments,
  getAdminProcurement,
  updateProcurement
} from "../controllers/procurementController.js";
const router = express.Router();

router.get(
  "/my",
  protect,
  getMyProcurement
);



router.post(
  "/",
  protect,
  createProcurement
);

router.get(
  "/payments",
  protect,
  getMyPayments
);

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminProcurement
);

router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateProcurement
);


export default router;