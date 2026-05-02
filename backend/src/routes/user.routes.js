const express = require("express");
const {
  updateProfile,
  changePassword,
  updatePreferences,
  toggleFavorite,
  getFavorites,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.put("/preferences", updatePreferences);
router.post("/favorites", toggleFavorite);
router.get("/favorites", getFavorites);

module.exports = router;
