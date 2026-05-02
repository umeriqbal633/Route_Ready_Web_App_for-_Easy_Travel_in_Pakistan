const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      trim: true,
    },
    badgeClass: {
      type: String,
      default: "",
    },
    amenities: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Query indexes for filtering
hotelSchema.index({ city: 1, stars: 1, price: 1 });

module.exports = mongoose.model("Hotel", hotelSchema);
