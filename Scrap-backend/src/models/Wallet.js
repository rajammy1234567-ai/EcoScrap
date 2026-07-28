const mongoose = require("mongoose");

/**
 * One wallet per scrapper (company-funded float).
 * All money movement is tracked via WalletTransaction.
 */
const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    /** Lifetime stats (admin reporting) */
    totalCredited: { type: Number, default: 0 },
    totalDebited: { type: Number, default: 0 },
    isFrozen: { type: Boolean, default: false },
    frozenReason: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Wallet", walletSchema);
