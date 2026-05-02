const Trip = require("../models/Trip");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/trips — save a generated itinerary
const createTrip = asyncHandler(async (req, res) => {
  const { title, city, startDate, endDate, days, interests, totalBudget } =
    req.body;

  const trip = await Trip.create({
    user: req.user._id,
    title,
    city,
    startDate,
    endDate,
    days,
    interests,
    totalBudget,
    status: "planning",
  });

  res.status(201).json({
    success: true,
    message: "Trip saved",
    data: trip,
  });
});

// GET /api/trips — get user's trips
const getTrips = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user._id };

  if (status) {
    filter.status = status;
  }

  const trips = await Trip.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: trips.length,
    data: trips,
  });
});

// GET /api/trips/:id — get single trip
const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found",
    });
  }

  res.status(200).json({
    success: true,
    data: trip,
  });
});

// PUT /api/trips/:id — update trip
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true },
  );

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Trip updated",
    data: trip,
  });
});

// DELETE /api/trips/:id — delete trip
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Trip deleted",
  });
});

module.exports = {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
};
