const Pickup = require("../models/Pickup");

exports.createPickup = async (req, res) => {
  try {
    const { address_id, items, image_urls, scheduled_at, notes } = req.body;
    if (!address_id || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "address_id and items are required" });
    }
    const pickup = await Pickup.create({
      user: req.user?._id,
      address_id,
      items,
      image_urls: image_urls ?? [],
      scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
      notes,
    });
    // normalize response to include `id` for frontend convenience
    const out = pickup.toObject ? pickup.toObject() : pickup;
    out.id = out._id;
    res.status(201).json({ success: true, pickup: out });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.listPickups = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const pickups = await Pickup.find(filter).sort({ createdAt: -1 });
    // Normalize each pickup to include `id` field
    const normalized = pickups.map((p) => {
      const out = p.toObject ? p.toObject() : p;
      out.id = out._id;
      return out;
    });
    res.json({ success: true, pickups: normalized });
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
    res.json({ success: true, pickup: out });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
