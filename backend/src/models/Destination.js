const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      enum: [
        "Religious",
        "Nature",
        "Landmark",
        "Culture",
        "Shopping",
        "Historic",
        "Beach",
        "Food",
        "Adventure",
      ],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    price: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    detailImage: {
      type: String,
      default: "",
    },
    highlights: [
      {
        icon: String,
        title: String,
        subtitle: String,
      },
    ],
    tips: [String],
    openingHours: {
      type: String,
      default: "Open 24 hours",
    },
    bestTime: {
      type: String,
      default: "Morning",
    },
    duration: {
      type: String,
      default: "1-2 hours",
    },
    isHiddenGem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Text index for search
destinationSchema.index({ name: "text", city: "text", description: "text" });
// Query index for filtering
destinationSchema.index({ city: 1, category: 1 });

module.exports = mongoose.model("Destination", destinationSchema);
