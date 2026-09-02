import express from "express";
import {
  getCentres
} from "../controllers/centreController.js";

const router = express.Router();

router.get("/", getCentres);

export default router;