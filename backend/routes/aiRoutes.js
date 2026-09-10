import express from "express";

import {
  chatWithAI,
} from "../controllers/aiController.js";

import {
  protect,
} from "../middleware/auth.js";

const router = express.Router();

/*
   Farmer must be logged in
*/
router.post(
  "/chat",
  protect,
  chatWithAI
);

export default router;