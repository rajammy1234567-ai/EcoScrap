const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2.5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/** KYC docs — images only, slightly higher limit for phone photos */
const kycUpload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for KYC"));
    }
  },
});

/** Demo video for home screen (admin gallery upload) */
const videoUpload = multer({
  storage,
  limits: { fileSize: 18 * 1024 * 1024 }, // ~18MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed (mp4, webm, mov)"));
    }
  },
});

module.exports = { upload, kycUpload, videoUpload };
