const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "signup_bonus", // ₹5000 on scrapper approve
        "admin_topup", // admin loads float
        "admin_adjustment", // manual fix
        "customer_payout", // paid seller for scrap
        "payout_refund", // failed payout reverse
        "other",
      ],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },
    description: { type: String, trim: true },
    /** Related entities */
    pickup: { type: mongoose.Schema.Types.ObjectId, ref: "Pickup" },
    payout: { type: mongoose.Schema.Types.ObjectId, ref: "Payout" },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

walletTransactionSchema.index({ createdAt: -1 });
walletTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
