const User = require("../models/User");
const { isValidCoords, NEARBY_RADIUS_KM } = require("../utils/geo");

exports.checkService = async (req, res) => {
  try {
    const { pincode } = req.body;
    if (!pincode || typeof pincode !== "string") {
      return res.status(400).json({ message: "Pincode is required" });
    }

    const normalizedPincode = pincode.trim();
    if (normalizedPincode.length !== 6 || !/^\d{6}$/.test(normalizedPincode)) {
      return res
        .status(400)
        .json({ message: "Pincode must be a 6-digit number" });
    }

    // For now, accept all valid 6-digit pincodes as serviceable.
    const is_available = true;
    res.json({ is_available });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.notifyMe = async (req, res) => {
  try {
    const { pincode, phone } = req.body;
    if (!pincode) {
      return res.status(400).json({ message: "Pincode is required" });
    }

    // In a real app this would save a notification request to the database.
    res.json({
      message: "Thank you! We will notify you when service is available.",
      pincode,
      phone,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/v1/location/update
 * Body: { latitude, longitude }
 * Stores live GPS for the authenticated user (customer or scrapper).
 */
exports.updateLocation = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const { latitude, longitude } = req.body || {};
    if (!isValidCoords(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        lastLocation: {
          latitude: lat,
          longitude: lng,
          updatedAt: new Date(),
        },
      },
      { new: true },
    ).select("lastLocation role scrapperStatus");

    res.json({
      success: true,
      message: "Location updated",
      lastLocation: user.lastLocation,
      nearbyRadiusKm: NEARBY_RADIUS_KM,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/location/me
 */
exports.getMyLocation = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const user = await User.findById(req.user._id).select("lastLocation");
    res.json({
      success: true,
      lastLocation: user?.lastLocation || null,
      nearbyRadiusKm: NEARBY_RADIUS_KM,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
