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

const allowedOrigins = (process.env.FRONTEND_URLS || "http://localhost:5173")
  .split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json());
app.use((req, _res, next) => {
  req.cookies = Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
  next();
});
app.set("trust proxy", 1);

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
