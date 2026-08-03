const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, minlength: 6 },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ["email", "phone", "google"],
      default: "email",
    },
    addresses: [
      {
        type: {
          type: String,
          enum: ["home", "office", "other"],
          default: "home",
        },
        flat_number: { type: String },
        locality: { type: String },
        city: { type: String },
        pincode: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        is_default: { type: Boolean, default: false },
      },
    ],
    /** Live GPS position (users + scrapers) for 10km matching */
    lastLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      updatedAt: { type: Date },
    },
    role: {
      type: String,
      enum: ["user", "admin", "scrapper"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    pushToken: { type: String },
    fcmToken: { type: String },
    devicePlatform: {
      type: String,
      enum: ["android", "ios", "web"],
      default: "android",
    },
    /** Scrapper onboarding status (mirrors latest application) */
    scrapperStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    scrapperProfile: {
      vehicleType: { type: String },
      vehicleNumber: { type: String },
      city: { type: String },
      pincode: { type: String },
      serviceAreas: { type: String },
      aadhaarNumber: { type: String },
      panNumber: { type: String },
      upiId: { type: String },
      bankAccountName: { type: String },
      bankAccountNumber: { type: String },
      bankIfsc: { type: String },
      approvedAt: { type: Date },
      signupBonusAmount: { type: Number, default: 0 },
    },
    /** Customer preferred UPI for scrap payments */
    payoutUpi: { type: String, trim: true, lowercase: true },
    otpCode: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  // Skip re-hash if already bcrypt hash
  if (typeof this.password === "string" && this.password.startsWith("$2"))
    return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otpCode;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
