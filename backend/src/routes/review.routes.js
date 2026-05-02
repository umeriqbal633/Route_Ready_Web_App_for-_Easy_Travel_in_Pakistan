const express = require("express");
const { createReview, getReviews } = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/:destinationId", getReviews);

module.exports = router;
