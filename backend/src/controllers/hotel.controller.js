const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("../utils/asyncHandler");
const prisma = new PrismaClient();

// GET /api/hotels — list all with filters
const getHotels = asyncHandler(async (req, res) => {
  const { city, stars, maxPrice, amenities, sort, limit = 200 } = req.query;

  const where = {};

  if (city && city !== "all") {
    where.city = { mode: "insensitive", contains: city };
  }

  if (stars) {
    const starValues = stars.split(",").map(Number);
    where.stars = { in: starValues };
  }

  if (maxPrice) {
    where.pricePerNight = { lte: parseInt(maxPrice) };
  }

  if (amenities) {
    const amenList = amenities.split(",");
    where.amenities = { hasSome: amenList };
  }

  let orderBy = { rating: "desc" }; // default: recommended
  if (sort === "price-low") orderBy = { pricePerNight: "asc" };
  else if (sort === "price-high") orderBy = { pricePerNight: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };

  const hotels = await prisma.hotel.findMany({
    where,
    orderBy,
    take: parseInt(limit),
  });

  res.status(200).json({
    success: true,
    count: hotels.length,
    data: hotels,
  });
});

// GET /api/hotels/:id — single hotel
const getHotel = asyncHandler(async (req, res) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: req.params.id },
  });

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
