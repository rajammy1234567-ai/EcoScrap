const mongoose = require("mongoose");

const happyCustomerSchema = new mongoose.Schema(
  {
    pickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pickup",
      index: true,
    },
    scrapper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    /** Admin-created sample / managed entry */
    createdByAdmin: { type: Boolean, default: false, index: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    /** Photo after successful pickup (data URI or https URL) */
    photoUrl: { type: String, required: true },
    caption: { type: String, trim: true, default: "" },
    customerName: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    isPublic: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HappyCustomer", happyCustomerSchema);
