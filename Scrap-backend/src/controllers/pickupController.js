const Pickup = require("../models/Pickup");
const User = require("../models/User");
const { notifyUser } = require("../utils/notify");
const {
  isValidCoords,
  haversineKm,
  NEARBY_RADIUS_KM,
} = require("../utils/geo");

/**
 * Notify all approved scrapers within NEARBY_RADIUS_KM of the pickup location.
 */
async function notifyNearbyScrapers(pickup, addressLabel) {
  const lat = pickup.location?.latitude;
  const lng = pickup.location?.longitude;
  if (!isValidCoords(lat, lng)) {
    return { notified: 0, reason: "no_pickup_coords" };
  }

  const scrapers = await User.find({
    isActive: { $ne: false },
    $or: [{ role: "scrapper" }, { scrapperStatus: "approved" }],
    "lastLocation.latitude": { $exists: true, $ne: null },
    "lastLocation.longitude": { $exists: true, $ne: null },
  }).select("_id name lastLocation pushToken");

  const nearby = scrapers.filter((s) => {
    const d = haversineKm(
      lat,
      lng,
      s.lastLocation?.latitude,
      s.lastLocation?.longitude,
    );
    return d <= NEARBY_RADIUS_KM;
  });

  const place = addressLabel || "nearby";
  await Promise.all(
    nearby.map((s) => {
      const dist = haversineKm(
        lat,
        lng,
        s.lastLocation.latitude,
        s.lastLocation.longitude,
      );
      return notifyUser({
        userId: s._id,
        title: "New Pickup Nearby 📍",
        body: `New scrap pickup within ${dist.toFixed(1)} km (${place}). Open Scrapper Jobs to accept.`,
        type: "pickup_nearby",
        data: {
          pickupId: String(pickup._id),
          displayId: pickup.displayId || null,
          distanceKm: Number(dist.toFixed(2)),
          radiusKm: NEARBY_RADIUS_KM,
        },
      });
    }),
  );

  return { notified: nearby.length };
}

exports.createPickup = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to schedule a pickup",
      });
    }

    const {
      address_id,
      items,
      image_urls,
      scheduled_at,
      notes,
      latitude,
      longitude,
    } = req.body;
    if (!address_id || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "address_id and items are required" });
    }

    // Resolve coordinates: request body override → saved address → user lastLocation
    const user = await User.findById(req.user._id);
    const addr = user?.addresses?.id?.(address_id) ||
      user?.addresses?.find?.((a) => a._id.toString() === String(address_id));

    let pickupLat = null;
    let pickupLng = null;

    if (isValidCoords(latitude, longitude)) {
      pickupLat = Number(latitude);
      pickupLng = Number(longitude);
    } else if (addr && isValidCoords(addr.latitude, addr.longitude)) {
      pickupLat = Number(addr.latitude);
      pickupLng = Number(addr.longitude);
    } else if (isValidCoords(user?.lastLocation?.latitude, user?.lastLocation?.longitude)) {
      pickupLat = Number(user.lastLocation.latitude);
      pickupLng = Number(user.lastLocation.longitude);
    }

    // Persist coords on address if we have them but address doesn't
    if (
      addr &&
      isValidCoords(pickupLat, pickupLng) &&
      !isValidCoords(addr.latitude, addr.longitude)
    ) {
      addr.latitude = pickupLat;
      addr.longitude = pickupLng;
      await user.save();
    }

    const displayId =
      "PKG-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const pickupPayload = {
      user: req.user._id,
      address_id,
      items,
      image_urls: image_urls ?? [],
      scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
      notes,
      displayId,
    };

    if (isValidCoords(pickupLat, pickupLng)) {
      pickupPayload.location = {
        latitude: pickupLat,
        longitude: pickupLng,
      };
    }

    const pickup = await Pickup.create(pickupPayload);

    const addressLabel = addr
      ? [addr.locality, addr.city, addr.pincode].filter(Boolean).join(", ")
      : null;

    // Fire-and-forget nearby scrapper notifications (don't block response)
    let nearbyNotify = { notified: 0 };
    try {
      nearbyNotify = await notifyNearbyScrapers(pickup, addressLabel);
    } catch {
      // ignore notify failures
    }

    const out = pickup.toObject ? pickup.toObject() : pickup;
    out.id = out._id;
    res.status(201).json({
      success: true,
      pickup: out,
      nearbyScrapersNotified: nearbyNotify.notified,
      nearbyRadiusKm: NEARBY_RADIUS_KM,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.listPickups = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    }

    const pickups = await Pickup.find(filter).sort({ createdAt: -1 });

    const user = req.user ? await User.findById(req.user._id) : null;
    const userAddresses = user?.addresses || [];

    const normalized = pickups.map((p) => {
      const out = p.toObject ? p.toObject() : p;
      out.id = out._id;
      // User earnings = cash paid by scrapper (paymentAmount)
      const earned =
        Number(out.paymentAmount) > 0
          ? Number(out.paymentAmount)
          : Number(out.total_amount) > 0
            ? Number(out.total_amount)
            : 0;
      out.paymentAmount = earned || out.paymentAmount || 0;
      out.total_amount = earned || null;
      if (out.address_id) {
        out.address =
          userAddresses.find((a) => a._id.toString() === out.address_id) ||
          null;
      }
      return out;
    });

    // Lifetime scrap cash earned (completed + paid)
    const totalEarned = normalized
      .filter(
        (p) =>
          p.status === "completed" &&
          (p.paymentStatus === "paid" || Number(p.paymentAmount) > 0),
      )
      .reduce((sum, p) => sum + (Number(p.paymentAmount) || 0), 0);

    res.json({
      success: true,
      pickups: normalized,
      earnings: {
        totalEarned,
        completedPaidCount: normalized.filter(
          (p) =>
            p.status === "completed" && Number(p.paymentAmount) > 0,
        ).length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPickup = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup)
      return res.status(404).json({ success: false, message: "Not found" });
    const out = pickup.toObject ? pickup.toObject() : pickup;
    out.id = out._id;
    const earned =
      Number(out.paymentAmount) > 0
        ? Number(out.paymentAmount)
        : Number(out.total_amount) > 0
          ? Number(out.total_amount)
          : 0;
    out.paymentAmount = earned || out.paymentAmount || 0;
    out.total_amount = earned || null;

    const user = await User.findById(pickup.user);
    if (user && user.addresses) {
      const addr = user.addresses.find(
        (a) => a._id.toString() === pickup.address_id,
      );
      if (addr) out.address = addr;
    }

    res.json({ success: true, pickup: out });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelPickup = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res
        .status(404)
        .json({ success: false, message: "Pickup not found" });
    }

    if (
      !req.user ||
      (pickup.user &&
        pickup.user.toString() !== req.user._id.toString() &&
        req.user.role !== "admin")
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not allowed to cancel this pickup" });
    }

    if (pickup.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending pickups can be cancelled.",
      });
    }

    pickup.status = "cancelled";
    if (req.user.role !== "admin") {
      pickup.adminNote = "User cancelled this pickup";
    }
    await pickup.save();

    const out = pickup.toObject ? pickup.toObject() : pickup;
    out.id = out._id;
    res.json({ success: true, pickup: out });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
