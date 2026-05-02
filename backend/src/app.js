const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const healthRoutes = require("./routes/health.routes");
const destinationRoutes = require("./routes/destination.routes");
const hotelRoutes = require("./routes/hotel.routes");
const reviewRoutes = require("./routes/review.routes");
const tripRoutes = require("./routes/trip.routes");
const userRoutes = require("./routes/user.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin === "*" ? true : env.clientOrigin,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use("/api", limiter);

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/user", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

module.exports = app;

