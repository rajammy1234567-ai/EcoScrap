const mongoose = require("mongoose");

/**
 * Record of money paid by scrapper (from company wallet) to a scrap seller.
 * Razorpay fields used when live payout is attempted via admin Razorpay account.
 */
const payoutSchema = new mongoose.Schema(
  {
    pickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pickup",
      required: true,
      index: true,
    },
    scrapper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },
    method: {
      type: String,
      enum: ["upi", "cash", "bank", "razorpay_payout", "wallet_recorded"],
      default: "upi",
    },
    customerUpi: { type: String, trim: true },
    customerName: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "reversed"],
      default: "pending",
      index: true,
    },
    /** Razorpay / RazorpayX ids when available */
    razorpayContactId: { type: String },
    razorpayFundAccountId: { type: String },
    razorpayPayoutId: { type: String },
    razorpayStatus: { type: String },
    razorpayResponse: { type: mongoose.Schema.Types.Mixed },
    failureReason: { type: String },
    note: { type: String },
    scrapWeightKg: { type: Number },
    scrapItemsSummary: { type: String },
    walletTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
    },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

payoutSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payout", payoutSchema);
