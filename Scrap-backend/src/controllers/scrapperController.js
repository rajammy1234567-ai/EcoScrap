const ScrapperApplication = require("../models/ScrapperApplication");
const User = require("../models/User");
const Pickup = require("../models/Pickup");
const Payout = require("../models/Payout");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const { notifyUser } = require("../utils/notify");
const { creditWallet, debitWallet, getOrCreateWallet } = require("../utils/walletService");
const { createUpiPayout, publicStatus } = require("../utils/razorpay");
const {
  haversineKm,
  isValidCoords,
  NEARBY_RADIUS_KM,
} = require("../utils/geo");

const SIGNUP_BONUS = Number(process.env.SCRAPPER_SIGNUP_BONUS || 5000);
const MAX_DOC_CHARS = 3.5 * 1024 * 1024; // ~base64 size guard

const normalizeApp = (doc, includeDocs = false) => {
  if (!doc) return null;
  if (doc.toSafeJSON) return doc.toSafeJSON(includeDocs);
  const out = doc.toObject ? doc.toObject() : { ...doc };
  out.id = out._id;
  if (!includeDocs && out.kyc) {
    out.kyc = {
      aadhaarFront: !!out.kyc.aadhaarFront?.dataUri,
      aadhaarBack: !!out.kyc.aadhaarBack?.dataUri,
      panCard: !!out.kyc.panCard?.dataUri,
      selfie: !!out.kyc.selfie?.dataUri,
      cancelledCheque: !!out.kyc.cancelledCheque?.dataUri,
    };
  }
  return out;
};

const normalizePickup = (p) => {
  const out = p.toObject ? p.toObject() : { ...p };
  out.id = out._id;
  return out;
};

function parseDoc(raw, label) {
  if (!raw) return null;
  if (typeof raw === "object" && raw.dataUri) {
    if (String(raw.dataUri).length > MAX_DOC_CHARS) {
      throw new Error(`${label} image is too large (max ~2.5MB)`);
    }
    return {
      dataUri: raw.dataUri,
      mime: raw.mime || "image/jpeg",
      fileName: raw.fileName || label,
      uploadedAt: new Date(),
    };
  }
  const str = String(raw).trim();
  if (!str) return null;
  if (str.length > MAX_DOC_CHARS) {
    throw new Error(`${label} image is too large (max ~2.5MB)`);
  }
  const dataUri = str.startsWith("data:image")
    ? str
    : `data:image/jpeg;base64,${str}`;
  return {
    dataUri,
    mime: "image/jpeg",
    fileName: label,
    uploadedAt: new Date(),
  };
}

function fileToDoc(file, label) {
  if (!file?.buffer) return null;
  const mime = file.mimetype || "image/jpeg";
  return {
    dataUri: `data:${mime};base64,${file.buffer.toString("base64")}`,
    mime,
    fileName: file.originalname || label,
    uploadedAt: new Date(),
  };
}

const scrapperOnly = (user) =>
  user.role === "scrapper" || user.scrapperStatus === "approved";

const isValidPan = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(pan || "").toUpperCase());
const isValidUpi = (upi) =>
  !upi || /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(String(upi).trim());

// ── Apply ───────────────────────────────────────────────────────────────────

exports.applyAsScrapper = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role === "scrapper" || req.user.scrapperStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "You are already an approved scrapper",
      });
    }

    const existingPending = await ScrapperApplication.findOne({
      user: userId,
      status: "pending",
    });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending application",
        application: normalizeApp(existingPending),
      });
    }

    // Support multipart (req.body fields + req.files) or JSON
    // Bank / UPI are NOT collected at apply time — scrapper adds them after approval
    const body = req.body || {};
    const {
      fullName,
      phone,
      email,
      aadhaarNumber,
      panNumber,
      vehicleType,
      vehicleNumber,
      city,
      pincode,
      serviceAreas,
      experienceYears,
      address,
      notes,
    } = body;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !aadhaarNumber?.trim() ||
      !panNumber?.trim() ||
      !vehicleType ||
      !vehicleNumber?.trim() ||
      !city?.trim() ||
      !pincode?.trim() ||
      !address?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "fullName, phone, aadhaarNumber, panNumber, vehicleType, vehicleNumber, city, pincode and address are required",
      });
    }

    const aadhaarDigits = String(aadhaarNumber).replace(/\D/g, "");
    if (aadhaarDigits.length !== 12) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number must be 12 digits",
      });
    }

    const pan = String(panNumber).trim().toUpperCase();
    if (!isValidPan(pan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format (e.g. ABCDE1234F)",
      });
    }

    const pincodeDigits = String(pincode).replace(/\D/g, "");
    if (pincodeDigits.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be 6 digits",
      });
    }

    const files = req.files || {};
    let aadhaarFront =
      fileToDoc(files.aadhaarFront?.[0], "aadhaarFront") ||
      parseDoc(body.aadhaarFront || body.kyc?.aadhaarFront, "aadhaarFront");
    let aadhaarBack =
      fileToDoc(files.aadhaarBack?.[0], "aadhaarBack") ||
      parseDoc(body.aadhaarBack || body.kyc?.aadhaarBack, "aadhaarBack");
    let panCard =
      fileToDoc(files.panCard?.[0], "panCard") ||
      parseDoc(body.panCard || body.kyc?.panCard, "panCard");
    let selfie =
      fileToDoc(files.selfie?.[0], "selfie") ||
      parseDoc(body.selfie || body.kyc?.selfie, "selfie");
    // Cancelled cheque / bank docs not required at apply time

    if (!aadhaarFront || !aadhaarBack || !panCard) {
      return res.status(400).json({
        success: false,
        message:
          "KYC documents required: Aadhaar front, Aadhaar back, and PAN card photos",
      });
    }

    const application = await ScrapperApplication.create({
      user: userId,
      fullName: fullName.trim(),
      phone: String(phone).replace(/\D/g, "").slice(-10),
      email: (email || req.user.email || "").trim().toLowerCase() || undefined,
      aadhaarNumber: aadhaarDigits,
      panNumber: pan,
      vehicleType,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      city: city.trim(),
      pincode: pincodeDigits,
      serviceAreas: serviceAreas?.trim() || "",
      experienceYears: Number(experienceYears) || 0,
      address: address.trim(),
      notes: notes?.trim() || "",
      // Bank / UPI left empty — filled after approval via /bank-details
      bankAccountName: "",
      bankAccountNumber: "",
      bankIfsc: "",
      upiId: "",
      kyc: {
        aadhaarFront,
        aadhaarBack,
        panCard,
        selfie: selfie || undefined,
      },
      kycComplete: true,
      status: "pending",
    });

    await User.findByIdAndUpdate(userId, { scrapperStatus: "pending" });

    await notifyUser({
      userId,
      title: "Scrapper Application + KYC Submitted",
      body: "Your KYC is under review. After approval, add bank / UPI details from Scrapper Wallet.",
      type: "scrapper_pending",
      data: { applicationId: String(application._id) },
    });

    res.status(201).json({
      success: true,
      message: "Application & KYC submitted successfully",
      application: normalizeApp(application, false),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending or approved application",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyApplication = async (req, res) => {
  try {
    const application = await ScrapperApplication.findOne({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    let wallet = null;
    if (scrapperOnly(req.user)) {
      wallet = await getOrCreateWallet(req.user._id);
    }

    res.json({
      success: true,
      application: normalizeApp(application, false),
      scrapperStatus: req.user.scrapperStatus || "none",
      role: req.user.role,
      isScrapper: scrapperOnly(req.user),
      signupBonus: SIGNUP_BONUS,
      wallet: wallet
        ? {
            balance: wallet.balance,
            totalCredited: wallet.totalCredited,
            totalDebited: wallet.totalDebited,
            isFrozen: wallet.isFrozen,
          }
        : null,
      razorpay: publicStatus(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Wallet (scrapper) ───────────────────────────────────────────────────────

exports.getMyWallet = async (req, res) => {
  try {
    if (!scrapperOnly(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only approved scrapers have a wallet",
      });
    }
    const wallet = await getOrCreateWallet(req.user._id);
    const { page = 1, limit = 30 } = req.query;
    const filter = { user: req.user._id };
    const total = await WalletTransaction.countDocuments(filter);
    const transactions = await WalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("pickup", "displayId status")
      .lean();

    res.json({
      success: true,
      wallet: {
        balance: wallet.balance,
        totalCredited: wallet.totalCredited,
        totalDebited: wallet.totalDebited,
        isFrozen: wallet.isFrozen,
        currency: wallet.currency,
      },
      transactions: transactions.map((t) => ({
        ...t,
        id: t._id,
      })),
      total,
      page: Number(page),
      razorpay: publicStatus(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/v1/scrapper/bank-details
 * Approved scrapers add / update bank + UPI after onboarding (not at apply time).
 */
exports.updateBankDetails = async (req, res) => {
  try {
    if (!scrapperOnly(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only approved scrapers can add bank details",
      });
    }

    const {
      upiId,
      bankAccountName,
      bankAccountNumber,
      bankIfsc,
    } = req.body || {};

    if (upiId && !isValidUpi(upiId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid UPI ID format (e.g. name@upi)",
      });
    }

    const ifsc = bankIfsc ? String(bankIfsc).trim().toUpperCase() : "";
    if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IFSC format",
      });
    }

    const acct = bankAccountNumber
      ? String(bankAccountNumber).replace(/\s/g, "")
      : "";
    if (acct && !/^\d{9,18}$/.test(acct)) {
      return res.status(400).json({
        success: false,
        message: "Bank account number must be 9–18 digits",
      });
    }

    const profileUpdates = {};
    if (upiId !== undefined) {
      profileUpdates["scrapperProfile.upiId"] = String(upiId || "")
        .trim()
        .toLowerCase();
    }
    if (bankAccountName !== undefined) {
      profileUpdates["scrapperProfile.bankAccountName"] = String(
        bankAccountName || "",
      ).trim();
    }
    if (bankAccountNumber !== undefined) {
      profileUpdates["scrapperProfile.bankAccountNumber"] = acct;
    }
    if (bankIfsc !== undefined) {
      profileUpdates["scrapperProfile.bankIfsc"] = ifsc;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: profileUpdates },
      { new: true },
    ).select("scrapperProfile name email phone");

    // Keep latest application in sync if present
    await ScrapperApplication.findOneAndUpdate(
      { user: req.user._id, status: "approved" },
      {
        $set: {
          upiId: user.scrapperProfile?.upiId || "",
          bankAccountName: user.scrapperProfile?.bankAccountName || "",
          bankAccountNumber: user.scrapperProfile?.bankAccountNumber || "",
          bankIfsc: user.scrapperProfile?.bankIfsc || "",
        },
      },
      { sort: { reviewedAt: -1 } },
    );

    res.json({
      success: true,
      message: "Bank / UPI details saved",
      bankDetails: {
        upiId: user.scrapperProfile?.upiId || "",
        bankAccountName: user.scrapperProfile?.bankAccountName || "",
        bankAccountNumber: user.scrapperProfile?.bankAccountNumber || "",
        bankIfsc: user.scrapperProfile?.bankIfsc || "",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBankDetails = async (req, res) => {
  try {
    if (!scrapperOnly(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only approved scrapers have bank details",
      });
    }
    const user = await User.findById(req.user._id).select("scrapperProfile");
    const p = user?.scrapperProfile || {};
    res.json({
      success: true,
      bankDetails: {
        upiId: p.upiId || "",
        bankAccountName: p.bankAccountName || "",
        bankAccountNumber: p.bankAccountNumber || "",
        bankIfsc: p.bankIfsc || "",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Jobs ────────────────────────────────────────────────────────────────────

exports.listScrapperJobs = async (req, res) => {
  try {
    if (!scrapperOnly(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only approved scrapers can view jobs",
      });
    }

    const { status, tab } = req.query;
    const filter = {};
    const scrapper = await User.findById(req.user._id).select("lastLocation");
    const scrapLat = scrapper?.lastLocation?.latitude;
    const scrapLng = scrapper?.lastLocation?.longitude;
    const hasScrapperLoc = isValidCoords(scrapLat, scrapLng);

    if (tab === "available") {
      filter.status = "pending";
      filter.$or = [
        { assignedScrapper: null },
        { assignedScrapper: { $exists: false } },
      ];
    } else if (tab === "mine" || !tab) {
      filter.assignedScrapper = req.user._id;
      if (status) filter.status = status;
    } else if (tab === "all") {
      filter.$or = [
        { assignedScrapper: req.user._id },
        {
          status: "pending",
          $or: [
            { assignedScrapper: null },
            { assignedScrapper: { $exists: false } },
          ],
        },
      ];
    }

    const pickups = await Pickup.find(filter)
      .populate("user", "name email phone addresses payoutUpi lastLocation")
      .populate("payout")
      .sort({ createdAt: -1 })
      .limit(100);

    const filterAvailableByDistance = tab === "available" || tab === "all";

    let normalized = pickups.map((p) => {
      const out = normalizePickup(p);
      if (out.user?.addresses && out.address_id) {
        out.address =
          out.user.addresses.find(
            (a) => a._id.toString() === String(out.address_id),
          ) || null;
      }

      // Resolve pickup coords: stored location → address → customer lastLocation
      let pLat = out.location?.latitude;
      let pLng = out.location?.longitude;
      if (!isValidCoords(pLat, pLng) && out.address) {
        pLat = out.address.latitude;
        pLng = out.address.longitude;
      }
      if (
        !isValidCoords(pLat, pLng) &&
        isValidCoords(
          out.user?.lastLocation?.latitude,
          out.user?.lastLocation?.longitude,
        )
      ) {
        pLat = out.user.lastLocation.latitude;
        pLng = out.user.lastLocation.longitude;
      }

      if (hasScrapperLoc && isValidCoords(pLat, pLng)) {
        out.distanceKm = Number(
          haversineKm(scrapLat, scrapLng, pLat, pLng).toFixed(2),
        );
      } else {
        out.distanceKm = null;
      }

      if (out.user) {
        out.customer = {
          name: out.user.name,
          phone: out.user.phone,
          email: out.user.email,
          payoutUpi: out.user.payoutUpi || null,
        };
        delete out.user.addresses;
        delete out.user.lastLocation;
      }
      return out;
    });

    // Available jobs: only show pickups within 10 km of scrapper
    if (filterAvailableByDistance && hasScrapperLoc) {
      normalized = normalized.filter((job) => {
        // Always keep jobs already assigned to this scrapper
        if (
          job.assignedScrapper &&
          String(job.assignedScrapper) === String(req.user._id)
        ) {
          return true;
        }
        // Unassigned available: must be within radius when we know distance
        if (job.distanceKm == null) return false;
        return job.distanceKm <= NEARBY_RADIUS_KM;
      });
    }

    // Sort available by nearest first
    if (tab === "available") {
      normalized.sort((a, b) => {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    res.json({
      success: true,
      pickups: normalized,
      nearbyRadiusKm: NEARBY_RADIUS_KM,
      scrapperHasLocation: hasScrapperLoc,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.acceptJob = async (req, res) => {
  try {
    if (!scrapperOnly(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only approved scrapers can accept jobs",
      });
    }

    const pickup = await Pickup.findById(req.params.id).populate(
      "user",
      "name phone",
    );
    if (!pickup) {
      return res
        .status(404)
        .json({ success: false, message: "Pickup not found" });
    }

    if (pickup.status === "cancelled" || pickup.status === "completed") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a ${pickup.status} pickup`,
      });
    }

    if (
      pickup.assignedScrapper &&
      pickup.assignedScrapper.toString() !== req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "This pickup is already assigned to another scrapper",
      });
    }

    pickup.assignedScrapper = req.user._id;
    pickup.assignedAt = new Date();
    if (pickup.status === "pending") pickup.status = "accepted";
    await pickup.save();

    if (pickup.user?._id) {
      await notifyUser({
        userId: pickup.user._id,
        title: "Scrapper Assigned",
        body: `${req.user.name || "A scrapper"} will pick up your scrap soon.`,
        type: "pickup_update",
        data: { pickupId: String(pickup._id), status: pickup.status },
      });
    }

    res.json({
      success: true,
      message: "Job accepted",
      pickup: normalizePickup(pickup),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Complete pickup + pay customer from scrapper wallet.
 * Body: { amount, customerUpi?, method?, note?, actualWeightKg?, scrapItemsSummary? }
 */
exports.completeAndPay = async (req, res) => {
  try {
    if (!scrapperOnly(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only approved scrapers can complete jobs",
      });
    }

    const pickup = await Pickup.findById(req.params.id).populate(
      "user",
      "name phone payoutUpi",
    );
    if (!pickup) {
      return res
        .status(404)
        .json({ success: false, message: "Pickup not found" });
    }

    if (
      !pickup.assignedScrapper ||
      pickup.assignedScrapper.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This job is not assigned to you",
      });
    }

    if (pickup.status === "completed" && pickup.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Already completed and paid",
      });
    }
    if (pickup.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Pickup was cancelled" });
    }

    const {
      amount,
      customerUpi,
      method = "upi",
      note,
      actualWeightKg,
      scrapItemsSummary,
    } = req.body || {};

    const payAmount = Number(amount);
    if (!payAmount || payAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Payment amount (₹) is required and must be at least 1",
      });
    }
    if (payAmount > 100000) {
      return res.status(400).json({
        success: false,
        message: "Amount exceeds single-transaction limit (₹1,00,000)",
      });
    }

    const upi =
      (customerUpi || pickup.user?.payoutUpi || "").trim().toLowerCase() ||
      null;
    if (method === "upi" && upi && !isValidUpi(upi)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer UPI ID",
      });
    }

    // Debit scrapper wallet first (company float)
    let walletResult;
    try {
      walletResult = await debitWallet({
        userId: req.user._id,
        amount: payAmount,
        category: "customer_payout",
        description: `Paid customer for pickup ${pickup.displayId || pickup._id}`,
        performedBy: req.user._id,
        pickup: pickup._id,
        meta: { method, customerUpi: upi },
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Create payout record
    const payout = await Payout.create({
      pickup: pickup._id,
      scrapper: req.user._id,
      customer: pickup.user?._id || pickup.user,
      amount: payAmount,
      method:
        method === "cash"
          ? "cash"
          : method === "bank"
            ? "bank"
            : upi
              ? "upi"
              : "wallet_recorded",
      customerUpi: upi || undefined,
      customerName: pickup.user?.name,
      status: "processing",
      note: note?.trim() || "",
      scrapWeightKg: actualWeightKg ? Number(actualWeightKg) : undefined,
      scrapItemsSummary: scrapItemsSummary || undefined,
      walletTransaction: walletResult.transaction._id,
    });

    // Optional RazorpayX UPI payout (admin account)
    let razorpayResult = null;
    if (upi && method !== "cash") {
      razorpayResult = await createUpiPayout({
        amountInr: payAmount,
        upiId: upi,
        name: pickup.user?.name || "Customer",
        referenceId: `pk_${pickup._id}`,
        notes: {
          pickupId: String(pickup._id),
          scrapperId: String(req.user._id),
        },
      });

      if (razorpayResult.mode === "razorpay_payout" && razorpayResult.success) {
        payout.method = "razorpay_payout";
        payout.razorpayContactId = razorpayResult.contactId;
        payout.razorpayFundAccountId = razorpayResult.fundAccountId;
        payout.razorpayPayoutId = razorpayResult.razorpayPayoutId;
        payout.razorpayStatus = razorpayResult.status;
        payout.razorpayResponse = razorpayResult.raw;
        payout.status =
          razorpayResult.status === "processed" ||
          razorpayResult.status === "processing" ||
          razorpayResult.status === "queued"
            ? "completed"
            : "processing";
      } else if (razorpayResult.mode === "razorpay_failed") {
        // Wallet already debited — mark completed as recorded; admin can reconcile
        payout.failureReason = razorpayResult.error;
        payout.status = "completed";
        payout.method = "wallet_recorded";
        payout.razorpayResponse = razorpayResult.raw;
      } else {
        // wallet_only mode
        payout.status = "completed";
        payout.method = method === "cash" ? "cash" : "wallet_recorded";
      }
    } else {
      payout.status = "completed";
      if (method === "cash") payout.method = "cash";
      else payout.method = "wallet_recorded";
    }

    if (payout.status === "completed") {
      payout.completedAt = new Date();
    }
    await payout.save();

    // Link tx → payout
    await WalletTransaction.findByIdAndUpdate(walletResult.transaction._id, {
      payout: payout._id,
    });

    pickup.status = "completed";
    pickup.paymentAmount = payAmount;
    pickup.paymentStatus =
      payout.status === "completed" ? "paid" : "processing";
    pickup.payout = payout._id;
    pickup.paidAt = new Date();
    if (note) pickup.scrapperNote = String(note).trim();
    if (actualWeightKg) pickup.actualWeightKg = Number(actualWeightKg);
    await pickup.save();

    if (pickup.user?._id) {
      await notifyUser({
        userId: pickup.user._id,
        title: "Scrap Paid ✓",
        body: `You received ₹${payAmount} for your scrap pickup${upi ? ` (UPI: ${upi})` : ""}.`,
        type: "pickup_update",
        data: {
          pickupId: String(pickup._id),
          amount: payAmount,
          status: "completed",
        },
      });
    }

    res.json({
      success: true,
      message: `Pickup completed. ₹${payAmount} paid to customer.`,
      pickup: normalizePickup(pickup),
      payout: {
        id: payout._id,
        amount: payout.amount,
        status: payout.status,
        method: payout.method,
        razorpayPayoutId: payout.razorpayPayoutId || null,
        failureReason: payout.failureReason || null,
      },
      wallet: {
        balance: walletResult.wallet.balance,
      },
      razorpay: publicStatus(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Legacy complete without payment (admin force etc.) — prefer completeAndPay */
exports.completeJob = async (req, res) => {
  try {
    if (!scrapperOnly(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only approved scrapers can complete jobs",
      });
    }

    const pickup = await Pickup.findById(req.params.id).populate(
      "user",
      "name phone",
    );
    if (!pickup) {
      return res
        .status(404)
        .json({ success: false, message: "Pickup not found" });
    }

    if (
      !pickup.assignedScrapper ||
      pickup.assignedScrapper.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This job is not assigned to you",
      });
    }

    if (pickup.status === "completed") {
      return res
        .status(400)
        .json({ success: false, message: "Already completed" });
    }
    if (pickup.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Pickup was cancelled" });
    }

    // Require payment path for production
    return res.status(400).json({
      success: false,
      message:
        "Use complete-and-pay with amount to finish pickup and pay the customer",
      code: "PAYMENT_REQUIRED",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: applications ─────────────────────────────────────────────────────

exports.adminListApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await ScrapperApplication.countDocuments(filter);
    const applications = await ScrapperApplication.find(filter)
      .select("-kyc.aadhaarFront.dataUri -kyc.aadhaarBack.dataUri -kyc.panCard.dataUri -kyc.selfie.dataUri -kyc.cancelledCheque.dataUri")
      .populate("user", "name email phone scrapperStatus role")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      applications: applications.map((a) => normalizeApp(a, false)),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      signupBonus: SIGNUP_BONUS,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminGetApplication = async (req, res) => {
  try {
    const application = await ScrapperApplication.findById(req.params.id)
      .populate("user", "name email phone scrapperStatus role");
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    res.json({
      success: true,
      application: normalizeApp(application, true),
      signupBonus: SIGNUP_BONUS,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminReviewApplication = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be "approved" or "rejected"',
      });
    }

    if (status === "rejected" && !adminNote?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason when rejecting",
      });
    }

    const application = await ScrapperApplication.findById(req.params.id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Application already ${application.status}`,
      });
    }

    // On approve, require KYC docs present
    if (status === "approved") {
      const k = application.kyc || {};
      if (!k.aadhaarFront?.dataUri || !k.aadhaarBack?.dataUri || !k.panCard?.dataUri) {
        return res.status(400).json({
          success: false,
          message: "Cannot approve: incomplete KYC documents",
        });
      }
    }

    application.status = status;
    application.adminNote = adminNote?.trim() || "";
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;

    const userUpdates = {
      scrapperStatus: status === "approved" ? "approved" : "rejected",
    };

    let walletInfo = null;

    if (status === "approved") {
      userUpdates.role = "scrapper";
      userUpdates.scrapperProfile = {
        vehicleType: application.vehicleType,
        vehicleNumber: application.vehicleNumber,
        city: application.city,
        pincode: application.pincode,
        serviceAreas: application.serviceAreas,
        aadhaarNumber: application.aadhaarNumber,
        panNumber: application.panNumber,
        // Bank/UPI empty until scrapper fills after approval
        upiId: application.upiId || "",
        bankAccountName: application.bankAccountName || "",
        bankAccountNumber: application.bankAccountNumber || "",
        bankIfsc: application.bankIfsc || "",
        approvedAt: new Date(),
        signupBonusAmount: SIGNUP_BONUS,
      };

      // Credit signup bonus ₹5000
      if (!application.signupBonusCredited && SIGNUP_BONUS > 0) {
        const { wallet, transaction } = await creditWallet({
          userId: application.user,
          amount: SIGNUP_BONUS,
          category: "signup_bonus",
          description: `Scrapper signup float credit ₹${SIGNUP_BONUS}`,
          performedBy: req.user._id,
          meta: { applicationId: String(application._id) },
        });
        application.signupBonusCredited = true;
        application.signupBonusAmount = SIGNUP_BONUS;
        walletInfo = {
          balance: wallet.balance,
          credited: SIGNUP_BONUS,
          transactionId: transaction._id,
        };
      }
    }

    await application.save();
    await User.findByIdAndUpdate(application.user, userUpdates);

    const reason = application.adminNote || "";
    if (status === "approved") {
      await notifyUser({
        userId: application.user,
        title: "Scrapper Approved + ₹" + SIGNUP_BONUS + " Credited 🎉",
        body: `Your KYC is verified. ₹${SIGNUP_BONUS} float is now in your wallet to pay customers. ${reason}`.trim(),
        type: "scrapper_approved",
        reason: reason || "KYC approved",
        data: {
          applicationId: String(application._id),
          signupBonus: SIGNUP_BONUS,
        },
      });
    } else {
      await notifyUser({
        userId: application.user,
        title: "Scrapper Application Rejected",
        body: `Your application was not approved. Reason: ${reason}`,
        type: "scrapper_rejected",
        reason,
        data: { applicationId: String(application._id) },
      });
    }

    res.json({
      success: true,
      message:
        status === "approved"
          ? `Approved. ₹${SIGNUP_BONUS} credited to scrapper wallet.`
          : `Application rejected`,
      application: normalizeApp(application, false),
      wallet: walletInfo,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminListScrappers = async (req, res) => {
  try {
    const scrapers = await User.find({
      $or: [{ role: "scrapper" }, { scrapperStatus: "approved" }],
    })
      .select(
        "name email phone scrapperProfile scrapperStatus role createdAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    const ids = scrapers.map((s) => s._id);
    const wallets = await Wallet.find({ user: { $in: ids } }).lean();
    const wMap = new Map(wallets.map((w) => [String(w.user), w]));

    const enriched = scrapers.map((s) => {
      const w = wMap.get(String(s._id));
      return {
        ...s,
        wallet: w
          ? {
              balance: w.balance,
              totalCredited: w.totalCredited,
              totalDebited: w.totalDebited,
              isFrozen: w.isFrozen,
            }
          : { balance: 0, totalCredited: 0, totalDebited: 0, isFrozen: false },
      };
    });

    res.json({ success: true, scrapers: enriched, signupBonus: SIGNUP_BONUS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminAssignScrapper = async (req, res) => {
  try {
    const { scrapperId } = req.body;
    if (!scrapperId) {
      return res
        .status(400)
        .json({ success: false, message: "scrapperId is required" });
    }

    const scrapper = await User.findById(scrapperId);
    if (
      !scrapper ||
      (scrapper.role !== "scrapper" && scrapper.scrapperStatus !== "approved")
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid scrapper" });
    }

    const pickup = await Pickup.findById(req.params.id).populate(
      "user",
      "name phone",
    );
    if (!pickup) {
      return res
        .status(404)
        .json({ success: false, message: "Pickup not found" });
    }

    pickup.assignedScrapper = scrapper._id;
    pickup.assignedAt = new Date();
    if (pickup.status === "pending") pickup.status = "accepted";
    await pickup.save();

    await notifyUser({
      userId: scrapper._id,
      title: "New Pickup Assigned",
      body: `You have been assigned pickup ${pickup.displayId || pickup._id}. Open Scrapper Jobs to view details.`,
      type: "pickup_assigned",
      data: { pickupId: String(pickup._id) },
    });

    if (pickup.user?._id) {
      await notifyUser({
        userId: pickup.user._id,
        title: "Scrapper Assigned",
        body: `${scrapper.name || "A scrapper"} has been assigned to your pickup.`,
        type: "pickup_update",
        data: { pickupId: String(pickup._id) },
      });
    }

    res.json({
      success: true,
      message: "Scrapper assigned",
      pickup: normalizePickup(pickup),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: wallet / ledger ──────────────────────────────────────────────────

exports.adminWalletOverview = async (req, res) => {
  try {
    const wallets = await Wallet.find()
      .populate("user", "name phone email role scrapperStatus")
      .sort({ balance: -1 })
      .lean();

    const agg = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalFloat: { $sum: "$balance" },
          totalCredited: { $sum: "$totalCredited" },
          totalDebited: { $sum: "$totalDebited" },
          count: { $sum: 1 },
        },
      },
    ]);

    const payoutAgg = await Payout.aggregate([
      {
        $group: {
          _id: "$status",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      summary: agg[0] || {
        totalFloat: 0,
        totalCredited: 0,
        totalDebited: 0,
        count: 0,
      },
      payoutsByStatus: payoutAgg,
      wallets: wallets.map((w) => ({
        ...w,
        id: w._id,
      })),
      signupBonus: SIGNUP_BONUS,
      razorpay: publicStatus(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminWalletTransactions = async (req, res) => {
  try {
    const { userId, category, type, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (userId) filter.user = userId;
    if (category) filter.category = category;
    if (type) filter.type = type;

    const total = await WalletTransaction.countDocuments(filter);
    const transactions = await WalletTransaction.find(filter)
      .populate("user", "name phone")
      .populate("pickup", "displayId")
      .populate("performedBy", "name")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      transactions: transactions.map((t) => ({ ...t, id: t._id })),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminTopupWallet = async (req, res) => {
  try {
    const { userId, amount, note } = req.body;
    const amt = Number(amount);
    if (!userId || !amt || amt < 1) {
      return res.status(400).json({
        success: false,
        message: "userId and amount (>=1) required",
      });
    }

    const user = await User.findById(userId);
    if (!user || (user.role !== "scrapper" && user.scrapperStatus !== "approved")) {
      return res.status(400).json({
        success: false,
        message: "User is not an approved scrapper",
      });
    }

    const { wallet, transaction } = await creditWallet({
      userId,
      amount: amt,
      category: "admin_topup",
      description: note?.trim() || `Admin top-up ₹${amt}`,
      performedBy: req.user._id,
      meta: { source: "admin_panel" },
    });

    await notifyUser({
      userId,
      title: "Wallet Top-up",
      body: `₹${amt} added to your scrapper wallet. New balance: ₹${wallet.balance}`,
      type: "general",
      data: { amount: amt, balance: wallet.balance },
    });

    res.json({
      success: true,
      message: `Credited ₹${amt}`,
      wallet: {
        balance: wallet.balance,
        totalCredited: wallet.totalCredited,
        totalDebited: wallet.totalDebited,
      },
      transaction: { id: transaction._id, amount: transaction.amount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminListPayouts = async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Payout.countDocuments(filter);
    const payouts = await Payout.find(filter)
      .populate("scrapper", "name phone")
      .populate("customer", "name phone")
      .populate("pickup", "displayId status")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      payouts: payouts.map((p) => ({ ...p, id: p._id })),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      razorpay: publicStatus(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
