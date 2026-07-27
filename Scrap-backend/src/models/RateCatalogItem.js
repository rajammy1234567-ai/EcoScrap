const mongoose = require("mongoose");

/**
 * Rate card catalog — managed by admin.
 * image_url can be a full URL or data:image/...;base64,... (permanent in DB).
 */
const rateCatalogItemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    rate_per_kg: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "Kg", trim: true },
    image_url: { type: String, default: null },
    sort_order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

rateCatalogItemSchema.index({ category: 1, sort_order: 1 });

module.exports = mongoose.model("RateCatalogItem", rateCatalogItemSchema);
