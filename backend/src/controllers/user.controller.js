const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// PUT /api/auth/profile — update profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, city } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (city !== undefined) updateData.city = city;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated",
    data: user,
  });
});

// PUT /api/auth/password — change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// PUT /api/auth/preferences — save travel preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const { interests, budgetLevel, isStudent } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      preferences: {
        interests: interests || [],
        budgetLevel: budgetLevel || "",
        isStudent: isStudent || false,
      },
    },
    { new: true },
  );

  res.status(200).json({
    success: true,
    message: "Preferences updated",
    data: user.preferences,
  });
});

// POST /api/auth/favorites — toggle save/unsave a destination
const toggleFavorite = asyncHandler(async (req, res) => {
  const { destinationId } = req.body;
  const user = await User.findById(req.user._id);

  const index = user.savedDestinations.indexOf(destinationId);
  let action;

  if (index === -1) {
    user.savedDestinations.push(destinationId);
    action = "saved";
  } else {
    user.savedDestinations.splice(index, 1);
    action = "removed";
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: `Destination ${action}`,
    data: user.savedDestinations,
  });
});

// GET /api/auth/favorites — get saved destinations
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("savedDestinations");

  res.status(200).json({
    success: true,
    count: user.savedDestinations.length,
    data: user.savedDestinations,
  });
});

module.exports = {
  updateProfile,
  changePassword,
  updatePreferences,
  toggleFavorite,
  getFavorites,
};
