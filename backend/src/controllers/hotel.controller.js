const Hotel = require("../models/Hotel");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/hotels — list all with filters
const getHotels = asyncHandler(async (req, res) => {
  const { city, stars, maxPrice, amenities, sort } = req.query;

  const filter = {};

  if (city && city !== "all") {
    filter.city = new RegExp(`^${city}$`, "i");
  }

  if (stars) {
    const starValues = stars.split(",").map(Number);
    filter.stars = { $in: starValues };
  }

  if (maxPrice) {
    filter.price = { $lte: parseInt(maxPrice) };
  }

  if (amenities) {
    const amenList = amenities.split(",");
    filter.amenities = { $all: amenList };
  }

  let sortOption = { rating: -1 }; // default: recommended
  if (sort === "price-low") sortOption = { price: 1 };
  else if (sort === "price-high") sortOption = { price: -1 };
  else if (sort === "rating") sortOption = { rating: -1 };

  const hotels = await Hotel.find(filter).sort(sortOption);

  res.status(200).json({
    success: true,
    count: hotels.length,
    data: hotels,
  });
});

// GET /api/hotels/:id — single hotel
const getHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return res.status(404).json({
      success: false,
      message: "Hotel not found",
    });
  }

  res.status(200).json({
    success: true,
    data: hotel,
  });
});

module.exports = {
  getHotels,
  getHotel,
};
