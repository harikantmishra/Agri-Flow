
import express from "express";

import {
  protect,
  adminOnly
} from "../middleware/auth.js";

import {
  getAdminPayments,
  updatePayment,
    getPaymentInvoice
} from "../controllers/paymentController.js";

const router = express.Router();

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminPayments
);

router.get(
  "/invoice/:id",
  protect,
  getPaymentInvoice
);

router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updatePayment
);

export default router;

