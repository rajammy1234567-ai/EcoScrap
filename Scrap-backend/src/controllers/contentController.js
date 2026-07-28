const AppSettings = require("../models/AppSettings");
const HappyCustomer = require("../models/HappyCustomer");
const Pickup = require("../models/Pickup");

const DEFAULT_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

async function getOrCreateSettings() {
  let s = await AppSettings.findOne({ key: "main" });
  if (!s) {
    s = await AppSettings.create({ key: "main" });
  }
  return s;
}

/** GET /api/v1/content/home — public home content */
exports.getHomeContent = async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    // samples if empty
    const count = await HappyCustomer.countDocuments();
    if (count === 0) {
      await HappyCustomer.insertMany(
        [
          {
            photoUrl:
              "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600&h=450&fit=crop",
            customerName: "Priya Sharma",
            city: "Chandigarh",
            caption: "Got fair price for old newspaper & iron. Super easy!",
            isPublic: true,
            createdByAdmin: true,
          },
          {
            photoUrl:
              "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=450&fit=crop",
            customerName: "Rahul Mehta",
            city: "Mohali",
            caption: "Doorstep pickup same day. Highly recommend Eco Scrap.",
            isPublic: true,
            createdByAdmin: true,
          },
          {
            photoUrl:
              "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=450&fit=crop",
            customerName: "Ananya Gupta",
            city: "Panchkula",
            caption: "Sold AC & fridge. Transparent weighing & instant cash.",
            isPublic: true,
            createdByAdmin: true,
          },
          {
            photoUrl:
              "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=450&fit=crop",
            customerName: "Vikram Singh",
            city: "Zirakpur",
            caption: "Partner was polite and on time. 5 stars!",
            isPublic: true,
            createdByAdmin: true,
          },
        ],
      );
    }
    const happy = await HappyCustomer.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("photoUrl caption customerName city createdAt createdByAdmin")
      .lean();

    res.json({
      success: true,
      demoVideo: {
        url: settings.demoVideoUrl || DEFAULT_VIDEO,
        title: settings.demoVideoTitle || "How Eco Scrap works",
        poster: settings.demoVideoPoster || "",
      },
      happyCustomers: happy.map((h) => ({
        id: h._id,
        photoUrl: h.photoUrl,
        caption: h.caption,
        customerName: h.customerName || "Happy customer",
        city: h.city || "",
        createdAt: h.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/demo-video
 * Body JSON: { demoVideoUrl, demoVideoTitle, demoVideoPoster }
 * OR multipart: file field "video" (+ optional demoVideoTitle)
 */
exports.adminUpdateDemoVideo = async (req, res) => {
  try {
    const body = req.body || {};
    let demoVideoUrl = body.demoVideoUrl;
    const demoVideoTitle = body.demoVideoTitle;
    const demoVideoPoster = body.demoVideoPoster;

    // Gallery / file upload
    if (req.file?.buffer) {
      const mime = req.file.mimetype || "video/mp4";
      demoVideoUrl = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
    }

    if (!demoVideoUrl || !String(demoVideoUrl).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Provide a video URL (https://...) or upload a video file from gallery",
      });
    }

    const settings = await getOrCreateSettings();
    settings.demoVideoUrl = String(demoVideoUrl).trim();
    if (demoVideoTitle !== undefined && demoVideoTitle !== "") {
      settings.demoVideoTitle = String(demoVideoTitle).trim();
    }
    if (demoVideoPoster !== undefined) {
      settings.demoVideoPoster = String(demoVideoPoster).trim();
    }
    await settings.save();
    res.json({
      success: true,
      message: req.file
        ? "Demo video uploaded from gallery"
        : "Demo video URL saved",
      demoVideo: {
        url: settings.demoVideoUrl.startsWith("data:")
          ? "(stored as uploaded file)"
          : settings.demoVideoUrl,
        title: settings.demoVideoTitle,
        poster: settings.demoVideoPoster,
        // full URL for client preview when not huge data URI
        playUrl: settings.demoVideoUrl.startsWith("data:")
          ? settings.demoVideoUrl
          : settings.demoVideoUrl,
        isUploadedFile: String(settings.demoVideoUrl).startsWith("data:"),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/admin/demo-video */
exports.adminGetDemoVideo = async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      success: true,
      demoVideo: {
        url: settings.demoVideoUrl || DEFAULT_VIDEO,
        title: settings.demoVideoTitle,
        poster: settings.demoVideoPoster || "",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/v1/scrapper/happy-customers
 * Scrapper uploads photo after completing a pickup
 */
exports.createHappyCustomer = async (req, res) => {
  try {
    const user = req.user;
    const isScrapper =
      user.role === "scrapper" || user.scrapperStatus === "approved";
    if (!isScrapper) {
      return res.status(403).json({
        success: false,
        message: "Only approved scrapers can post happy customer photos",
      });
    }

    const { pickupId, photoUrl, caption, customerName, city } = req.body || {};
    if (!photoUrl || !String(photoUrl).trim()) {
      return res.status(400).json({
        success: false,
        message: "photoUrl is required",
      });
    }
    if (String(photoUrl).length > 4 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Photo too large (max ~3MB)",
      });
    }

    let pickup = null;
    if (pickupId) {
      pickup = await Pickup.findById(pickupId).populate("user", "name");
      if (!pickup) {
        return res
          .status(404)
          .json({ success: false, message: "Pickup not found" });
      }
      if (
        pickup.assignedScrapper &&
        String(pickup.assignedScrapper) !== String(user._id)
      ) {
        return res.status(403).json({
          success: false,
          message: "This pickup is not assigned to you",
        });
      }
    }

    const doc = await HappyCustomer.create({
      pickup: pickup?._id,
      scrapper: user._id,
      customer: pickup?.user?._id || pickup?.user,
      photoUrl: String(photoUrl).trim(),
      caption: (caption || "").trim().slice(0, 200),
      customerName:
        (customerName || pickup?.user?.name || "").trim().slice(0, 80) ||
        "Customer",
      city: (city || "").trim().slice(0, 80),
      isPublic: true,
    });

    res.status(201).json({
      success: true,
      message: "Happy customer photo added",
      happyCustomer: {
        id: doc._id,
        photoUrl: doc.photoUrl,
        caption: doc.caption,
        customerName: doc.customerName,
        city: doc.city,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function mapHappy(h) {
  return {
    id: h._id,
    photoUrl: h.photoUrl,
    caption: h.caption || "",
    customerName: h.customerName || "Happy customer",
    city: h.city || "",
    isPublic: h.isPublic !== false,
    createdByAdmin: !!h.createdByAdmin,
    createdAt: h.createdAt,
  };
}

/** Sample photos (Unsplash) — seeded once when DB empty */
const SAMPLE_HAPPY = [
  {
    photoUrl:
      "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600&h=450&fit=crop",
    customerName: "Priya Sharma",
    city: "Chandigarh",
    caption: "Got fair price for old newspaper & iron. Super easy!",
  },
  {
    photoUrl:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=450&fit=crop",
    customerName: "Rahul Mehta",
    city: "Mohali",
    caption: "Doorstep pickup same day. Highly recommend Eco Scrap.",
  },
  {
    photoUrl:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=450&fit=crop",
    customerName: "Ananya Gupta",
    city: "Panchkula",
    caption: "Sold AC & fridge. Transparent weighing & instant cash.",
  },
  {
    photoUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=450&fit=crop",
    customerName: "Vikram Singh",
    city: "Zirakpur",
    caption: "Partner was polite and on time. 5 stars!",
  },
];

async function ensureSampleHappyCustomers() {
  const count = await HappyCustomer.countDocuments();
  if (count > 0) return { seeded: false, count };
  const docs = await HappyCustomer.insertMany(
    SAMPLE_HAPPY.map((s) => ({
      ...s,
      isPublic: true,
      createdByAdmin: true,
      scrapper: null,
    })),
  );
  return { seeded: true, count: docs.length };
}

/** GET public list — auto-seeds samples if empty */
exports.listHappyCustomers = async (_req, res) => {
  try {
    await ensureSampleHappyCustomers();
    const happy = await HappyCustomer.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();
    res.json({
      success: true,
      happyCustomers: happy.map(mapHappy),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: happy customers CRUD ─────────────────────────────────────────────

exports.adminListHappyCustomers = async (_req, res) => {
  try {
    await ensureSampleHappyCustomers();
    const happy = await HappyCustomer.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({
      success: true,
      happyCustomers: happy.map(mapHappy),
      total: happy.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Admin add — photoUrl (https or data URI) or multipart image */
exports.adminCreateHappyCustomer = async (req, res) => {
  try {
    let photoUrl = req.body?.photoUrl;
    if (req.file?.buffer) {
      const mime = req.file.mimetype || "image/jpeg";
      photoUrl = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
    }
    if (!photoUrl || !String(photoUrl).trim()) {
      return res.status(400).json({
        success: false,
        message: "Photo URL or image file is required",
      });
    }
    if (String(photoUrl).length > 4 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Photo too large (max ~3MB)",
      });
    }

    const doc = await HappyCustomer.create({
      photoUrl: String(photoUrl).trim(),
      caption: String(req.body?.caption || "").trim().slice(0, 200),
      customerName:
        String(req.body?.customerName || "Happy customer").trim().slice(0, 80) ||
        "Happy customer",
      city: String(req.body?.city || "").trim().slice(0, 80),
      isPublic: req.body?.isPublic === "false" || req.body?.isPublic === false
        ? false
        : true,
      createdByAdmin: true,
      scrapper: null,
    });

    res.status(201).json({
      success: true,
      message: "Happy customer added",
      happyCustomer: mapHappy(doc),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminDeleteHappyCustomer = async (req, res) => {
  try {
    const doc = await HappyCustomer.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
    }
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** Re-seed samples (only adds samples if you pass force=true, else only when empty) */
exports.adminSeedHappyCustomers = async (req, res) => {
  try {
    const force = req.body?.force === true || req.query?.force === "true";
    if (force) {
      // Don't wipe real scrapper posts — only add samples that aren't already there by name+caption
      let added = 0;
      for (const s of SAMPLE_HAPPY) {
        const exists = await HappyCustomer.findOne({
          customerName: s.customerName,
          caption: s.caption,
          createdByAdmin: true,
        });
        if (!exists) {
          await HappyCustomer.create({
            ...s,
            isPublic: true,
            createdByAdmin: true,
            scrapper: null,
          });
          added += 1;
        }
      }
      return res.json({
        success: true,
        message: `Sample happy customers ready (+${added} new)`,
        added,
      });
    }
    const result = await ensureSampleHappyCustomers();
    res.json({
      success: true,
      message: result.seeded
        ? `Seeded ${result.count} samples`
        : "Already has entries — use force=true to add missing samples",
      ...result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
