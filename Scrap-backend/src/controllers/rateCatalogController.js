const RateCatalogItem = require("../models/RateCatalogItem");
const DEFAULTS = require("../data/defaultRateCatalog");

const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024; // ~2.5MB base64 payload limit

async function ensureSeeded() {
  const count = await RateCatalogItem.countDocuments();
  if (count > 0) return;
  await RateCatalogItem.insertMany(
    DEFAULTS.map((d) => ({ ...d, image_url: null, isActive: true })),
  );
  console.log(`Rate catalog seeded: ${DEFAULTS.length} items`);
}

function groupByCategory(items) {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category).push({
      id: item._id,
      key: item.key,
      name: item.name,
      rate_per_kg: item.rate_per_kg,
      unit: item.unit,
      image_url: item.image_url || null,
      sort_order: item.sort_order,
    });
  }
  return Array.from(map.entries()).map(([name, list]) => ({
    name,
    items: list,
  }));
}

/** Public: rate card for app */
exports.getRateCard = async (req, res) => {
  try {
    await ensureSeeded();
    const items = await RateCatalogItem.find({ isActive: true }).sort({
      category: 1,
      sort_order: 1,
      name: 1,
    });
    res.json({ success: true, categories: groupByCategory(items) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: full list */
exports.adminListRates = async (req, res) => {
  try {
    await ensureSeeded();
    const items = await RateCatalogItem.find().sort({
      category: 1,
      sort_order: 1,
      name: 1,
    });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: update rate / name / unit / active */
exports.adminUpdateRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rate_per_kg, unit, category, sort_order, isActive } =
      req.body;

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (rate_per_kg !== undefined) updates.rate_per_kg = Number(rate_per_kg);
    if (unit !== undefined) updates.unit = String(unit).trim();
    if (category !== undefined) updates.category = String(category).trim();
    if (sort_order !== undefined) updates.sort_order = Number(sort_order);
    if (isActive !== undefined) updates.isActive = !!isActive;

    const item = await RateCatalogItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Admin: permanently set image (stored in MongoDB as data URI).
 * Accepts:
 *  - multipart field "image"
 *  - or JSON body { image_base64: "data:image/...;base64,..." | raw base64, mime?: "image/jpeg" }
 */
exports.adminUploadImage = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RateCatalogItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    let dataUri = null;

    if (req.file && req.file.buffer) {
      if (req.file.size > MAX_IMAGE_BYTES) {
        return res.status(400).json({
          success: false,
          message: "Image too large. Max ~2MB.",
        });
      }
      const mime = req.file.mimetype || "image/jpeg";
      if (!mime.startsWith("image/")) {
        return res
          .status(400)
          .json({ success: false, message: "Only image files allowed" });
      }
      dataUri = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
    } else if (req.body.image_base64) {
      let raw = String(req.body.image_base64).trim();
      if (raw.startsWith("data:image")) {
        dataUri = raw;
      } else {
        const mime = req.body.mime || "image/jpeg";
        dataUri = `data:${mime};base64,${raw}`;
      }
      // rough size check
      if (dataUri.length > MAX_IMAGE_BYTES * 1.4) {
        return res.status(400).json({
          success: false,
          message: "Image too large. Max ~2MB.",
        });
      }
    } else if (req.body.image_url) {
      // External URL (CDN) — permanent if URL stays valid
      dataUri = String(req.body.image_url).trim();
    } else {
      return res.status(400).json({
        success: false,
        message: "Provide image file, image_base64, or image_url",
      });
    }

    item.image_url = dataUri;
    await item.save();

    res.json({
      success: true,
      message: "Image updated permanently",
      item,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: remove image */
exports.adminClearImage = async (req, res) => {
  try {
    const item = await RateCatalogItem.findByIdAndUpdate(
      req.params.id,
      { image_url: null },
      { new: true },
    );
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin: create item */
exports.adminCreateRate = async (req, res) => {
  try {
    const { name, category, rate_per_kg, unit, key, sort_order } = req.body;
    if (!name || !category || rate_per_kg === undefined) {
      return res.status(400).json({
        success: false,
        message: "name, category, rate_per_kg required",
      });
    }
    const slug =
      key ||
      String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const item = await RateCatalogItem.create({
      key: slug,
      name: String(name).trim(),
      category: String(category).trim(),
      rate_per_kg: Number(rate_per_kg),
      unit: unit || "Kg",
      sort_order: sort_order ?? 0,
      image_url: null,
      isActive: true,
    });
    res.status(201).json({ success: true, item });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Item key already exists" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Keep public categories/items for pickup flow (unchanged sample + rates link)
const FALLBACK_CATS = [
  { id: "paper", name: "Paper", icon_url: null, sort_order: 1 },
  { id: "metal", name: "Metals", icon_url: null, sort_order: 2 },
  { id: "ewaste", name: "E-Waste", icon_url: null, sort_order: 3 },
  { id: "carton", name: "Cartons / Plastics", icon_url: null, sort_order: 4 },
  { id: "others", name: "Others", icon_url: null, sort_order: 5 },
  { id: "appliance", name: "Big Appliances", icon_url: null, sort_order: 6 },
];

const SAMPLE_ITEMS = {
  paper: [
    { id: "paper-1", name: "Newspaper" },
    { id: "paper-2", name: "Books" },
  ],
  metal: [
    { id: "metal-1", name: "Iron" },
    { id: "metal-2", name: "Copper" },
  ],
  ewaste: [
    { id: "ewaste-1", name: "Laptop" },
    { id: "ewaste-2", name: "Phone" },
  ],
  carton: [
    { id: "carton-1", name: "Cardboard" },
    { id: "carton-2", name: "Plastic Bottles" },
  ],
  others: [{ id: "others-1", name: "Battery" }],
  appliance: [
    { id: "appliance-1", name: "Fridge" },
    { id: "appliance-2", name: "Washing Machine" },
    { id: "appliance-3", name: "AC" },
  ],
};

exports.getCategories = async (req, res) => {
  res.json({ success: true, categories: FALLBACK_CATS });
};

exports.getItems = async (req, res) => {
  const { id } = req.params;
  res.json({ success: true, items: SAMPLE_ITEMS[id] ?? [] });
};
