const mongoose = require("mongoose");

/** Singleton app-wide settings (demo video, etc.) */
const appSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "main" },
    /** Demo video URL played on home (admin can replace) */
    demoVideoUrl: {
      type: String,
      default:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    demoVideoTitle: {
      type: String,
      default: "How Eco Scrap works",
    },
    demoVideoPoster: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AppSettings", appSettingsSchema);
