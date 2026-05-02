const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate reviews from the same user for the same destination
reviewSchema.index({ user: 1, destination: 1 }, { unique: true });
// Fast lookup of reviews per destination
reviewSchema.index({ destination: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
