const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    address_id: { type: String, required: true },
    items: [{ scrap_item_id: String, estimated_qty: Number }],
    image_urls: [{ type: String }],
    scheduled_at: { type: Date },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    adminNote: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pickup", pickupSchema);
