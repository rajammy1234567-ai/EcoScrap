const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "scrapper_approved",
        "scrapper_rejected",
        "scrapper_pending",
        "pickup_assigned",
        "pickup_nearby",
        "pickup_update",
        "general",
      ],
      default: "general",
    },
    data: { type: mongoose.Schema.Types.Mixed },
    reason: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
