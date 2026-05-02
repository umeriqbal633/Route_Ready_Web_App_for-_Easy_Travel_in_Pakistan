const Destination = require("../models/Destination");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/destinations — list all with filters
const getDestinations = asyncHandler(async (req, res) => {
  const { city, category, search, sort, hiddenGems } = req.query;

  const filter = {};

  if (city && city !== "all") {
    filter.city = new RegExp(`^${city}$`, "i");
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (hiddenGems === "true") {
    filter.isHiddenGem = true;
  }

  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { city: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ];
  }

  let sortOption = { rating: -1 }; // default: highest rated
  if (sort === "price-low") sortOption = { price: 1 };
  else if (sort === "price-high") sortOption = { price: -1 };
  else if (sort === "name") sortOption = { name: 1 };

  const destinations = await Destination.find(filter).sort(sortOption);

  res.status(200).json({
    success: true,
    count: destinations.length,
    data: destinations,
  });
});

// GET /api/destinations/:id — single destination
const getDestination = asyncHandler(async (req, res) => {
  const destination = await Destination.findById(req.params.id);

  if (!destination) {
    return res.status(404).json({
      success: false,
      message: "Destination not found",
    });
  }

  res.status(200).json({
    success: true,
    data: destination,
  });
});

module.exports = {
  getDestinations,
  getDestination,
};
