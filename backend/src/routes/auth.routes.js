const express = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const {
  validate,
  registerValidation,
  loginValidation,
} = require("../validators/auth.validators");

const router = express.Router();

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, me);

module.exports = router;
