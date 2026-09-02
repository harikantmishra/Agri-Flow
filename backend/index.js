import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import centreRoutes from "./routes/centreRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import procurementRoutes from "./routes/procurementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";


dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message:
      "AGRI-FLOW API is running"
  });
});

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/centres",
  centreRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/procurement",
  procurementRoutes
);

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});