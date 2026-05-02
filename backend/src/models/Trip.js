const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String, default: "1 hour" },
    cost: { type: Number, default: 0 },
    category: { type: String, default: "Sightseeing" },
  },
  { _id: false },
);

const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    activities: [activitySchema],
  },
  { _id: false },
);

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    days: [daySchema],
    interests: {
      type: [String],
      default: [],
    },
    totalBudget: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["planning", "upcoming", "active", "completed"],
      default: "planning",
    },
  },
  {
    timestamps: true,
  },
);

// Index for fetching user's trips quickly
tripSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Trip", tripSchema);
