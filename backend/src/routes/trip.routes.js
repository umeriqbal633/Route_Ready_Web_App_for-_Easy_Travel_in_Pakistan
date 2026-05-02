const express = require("express");
const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
} = require("../controllers/trip.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All trip routes require authentication
router.use(protect);

router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:id", getTrip);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

module.exports = router;
