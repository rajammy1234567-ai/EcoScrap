const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    address_id: { type: String, required: true },
    items: [{ scrap_item_id: String, estimated_qty: Number }],
    image_urls: [{ type: String }],
    scheduled_at: { type: Date },
    notes: { type: String },
    /** Snapshot of pickup address coords for nearby scrapper matching */
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    adminNote: { type: String },
    displayId: { type: String },
    /** Assigned scrapper (kabadiwala) who will collect */
    assignedScrapper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    scrapperNote: { type: String },
    assignedAt: { type: Date },
    /** Payment to customer for collected scrap */
    paymentAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "processing", "paid", "failed"],
      default: "unpaid",
      index: true,
    },
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
      default: null,
    },
    paidAt: { type: Date },
    actualWeightKg: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pickup", pickupSchema);
