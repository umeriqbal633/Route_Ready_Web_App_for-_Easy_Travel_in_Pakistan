const Review = require("../models/Review");
const Destination = require("../models/Destination");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/reviews — create a review
const createReview = asyncHandler(async (req, res) => {
  const { destinationId, stars, text } = req.body;

  // Check destination exists
  const destination = await Destination.findById(destinationId);
  if (!destination) {
    return res.status(404).json({
      success: false,
      message: "Destination not found",
    });
  }

  // Check if user already reviewed this destination
  const existing = await Review.findOne({
    user: req.user._id,
    destination: destinationId,
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: "You have already reviewed this destination",
    });
  }

  const review = await Review.create({
    user: req.user._id,
    destination: destinationId,
    stars,
    text,
  });

  // Populate user info for the response
  await review.populate("user", "name");

  res.status(201).json({
    success: true,
    message: "Review submitted",
    data: review,
  });
});

// GET /api/reviews/:destinationId — get reviews for a destination
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ destination: req.params.destinationId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(
          1,
        )
      : 0;

  res.status(200).json({
    success: true,
    count: reviews.length,
    avgRating: parseFloat(avgRating),
    data: reviews,
  });
});

module.exports = {
  createReview,
  getReviews,
};
