const mongoose = require("mongoose");

const docSchema = {
  dataUri: { type: String }, // data:image/...;base64,...
  mime: { type: String },
  fileName: { type: String },
  uploadedAt: { type: Date },
};

const scrapperApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    aadhaarNumber: { type: String, required: true, trim: true },
    panNumber: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: {
      type: String,
      enum: [
        "bike",
        "scooter",
        "auto",
        "e-rickshaw",
        "mini-truck",
        "truck",
        "other",
      ],
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    serviceAreas: { type: String, trim: true },
    experienceYears: { type: Number, default: 0, min: 0 },
    address: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },

    /** Bank / UPI for scrapper identity (not for receiving signup bonus) */
    bankAccountName: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankIfsc: { type: String, trim: true, uppercase: true },
    upiId: { type: String, trim: true, lowercase: true },

    /** KYC document images (base64 data URIs) */
    kyc: {
      aadhaarFront: docSchema,
      aadhaarBack: docSchema,
      panCard: docSchema,
      selfie: docSchema,
      cancelledCheque: docSchema,
    },
    kycComplete: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNote: { type: String, trim: true },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    /** Bonus credited on approve */
    signupBonusCredited: { type: Boolean, default: false },
    signupBonusAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

scrapperApplicationSchema.index(
  { user: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
  },
);

/** Strip heavy images for list views */
scrapperApplicationSchema.methods.toSafeJSON = function (includeDocs = false) {
  const obj = this.toObject();
  obj.id = obj._id;
  if (!includeDocs && obj.kyc) {
    obj.kyc = {
      aadhaarFront: !!obj.kyc.aadhaarFront?.dataUri,
      aadhaarBack: !!obj.kyc.aadhaarBack?.dataUri,
      panCard: !!obj.kyc.panCard?.dataUri,
      selfie: !!obj.kyc.selfie?.dataUri,
      cancelledCheque: !!obj.kyc.cancelledCheque?.dataUri,
    };
  }
  return obj;
};

module.exports = mongoose.model("ScrapperApplication", scrapperApplicationSchema);
