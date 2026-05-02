/**
 * RouteReady Backend Server
 * FAST-NUCES Islamabad
 * Taha Abid (24I-2507) & Umer Iqbal (24I-2528)
 * Database: PostgreSQL (Neon)
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { connectDB } = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// ===========================
// Middleware
// ===========================
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", globalLimiter);

// ===========================
// Routes
// ===========================

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RouteReady API is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: "PostgreSQL (Neon)",
    version: "1.0.0",
  });
});

// Root
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Welcome to RouteReady API",
    project: "RouteReady - Intelligent Travel Planning Web Application",
    team: "Taha Abid (24I-2507) & Umer Iqbal (24I-2528)",
    institution: "FAST-NUCES Islamabad",
    database: "PostgreSQL via Neon",
  });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes")); // Phase 2 ✅
app.use("/api/destinations", require("./routes/destinationRoutes")); // Phase 3 ✅
app.use("/api/hotels", require("./routes/hotelRoutes")); // Phase 3 ✅
app.use("/api/gems", require("./routes/gemRoutes")); // Phase 3 ✅
app.use("/api/users/profile", require("./routes/userRoutes")); // Phase 4 ✅
app.use("/api/reviews", require("./routes/reviewRoutes")); // Phase 4 ✅
app.use("/api/itineraries", require("./routes/itineraryRoutes")); // Phase 5 ✅
// app.use('/api/destinations', require('./routes/destRoutes')); // Phase 3
// app.use('/api/hotels', require('./routes/hotelRoutes'));      // Phase 3
// app.use('/api/gems', require('./routes/gemRoutes'));          // Phase 3
// app.use('/api/users', require('./routes/userRoutes'));        // Phase 4
// app.use('/api/reviews', require('./routes/reviewRoutes'));    // Phase 4
// app.use('/api/itineraries', require('./routes/itineraryRoutes')); // Phase 5
// app.use('/api/trackers', require('./routes/trackerRoutes'));  // Phase 6

// ===========================
// Error handling (must be last)
// ===========================
app.use(notFound);
app.use(errorHandler);

// ===========================
// Start server
// ===========================
app.listen(PORT, () => {
  console.log("");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   🚀 RouteReady Backend Server Started           ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║   Port:        ${PORT.toString().padEnd(34)}║`);
  console.log(
    `║   Environment: ${(process.env.NODE_ENV || "development").padEnd(34)}║`,
  );
  console.log(`║   Database:    ${"PostgreSQL (Neon)".padEnd(34)}║`);
  console.log(`║   URL:         http://localhost:${PORT}`.padEnd(51) + "║");
  console.log(
    `║   Health:      http://localhost:${PORT}/health`.padEnd(51) + "║",
  );
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("");
});

process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

module.exports = app;
