const express = require("express");
const { getHotels, getHotel } = require("../controllers/hotel.controller");

const router = express.Router();

router.get("/", getHotels);
router.get("/:id", getHotel);

module.exports = router;
