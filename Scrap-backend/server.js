require("dotenv").config();
const path = require("path");
const fs = require("fs");
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const errorHandler = require("./src/middlewares/errorHandler");
const authRoutes = require("./src/routes/authRoutes");
const scrapRoutes = require("./src/routes/scrapRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const addressRoutes = require("./src/routes/addressRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const publicScrapRoutes = require("./src/routes/publicScrapRoutes");
const pickupRoutes = require("./src/routes/pickupRoutes");
const scrapperRoutes = require("./src/routes/scrapperRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");

// Atlas SRV DNS — set before any Mongo connect
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // ignore
}

const app = express();

app.use(cors());
// KYC images (base64) need larger payloads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ── API routes ──
app.use("/api/auth", authRoutes);
app.use("/api/scraps", scrapRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/v1/users/me/addresses", addressRoutes);
app.use("/api/v1/location", locationRoutes);
app.use("/api/v1/scrap", publicScrapRoutes);
app.use("/api/v1/pickups", pickupRoutes);
app.use("/api/v1/scrapper", scrapperRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected 1=connected 2=connecting 3=disconnecting
  const dbLabel = ["disconnected", "connected", "connecting", "disconnecting"][
    dbState
  ] || "unknown";
  res.json({
    status: dbState === 1 ? "OK" : "DEGRADED",
    timestamp: new Date(),
    mongo: dbLabel,
  });
});

// ── Admin panel (Vite build) ──
// Prefer Scrap-backend/public (copied on deploy); fallback Scrap-admin/dist
const adminDistCandidates = [
  path.join(__dirname, "public"),
  path.join(__dirname, "..", "Scrap-admin", "dist"),
];
const adminDist = adminDistCandidates.find((p) =>
  fs.existsSync(path.join(p, "index.html")),
);

if (adminDist) {
  console.log("Serving admin UI from:", adminDist);
  app.use(express.static(adminDist));
  // SPA fallback — anything not /api/* → index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(adminDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
} else {
  console.warn(
    "Admin UI build not found. Run: npm run build:admin (from Scrap-backend)",
  );
  app.get("/", (_req, res) => {
    res
      .status(200)
      .type("html")
      .send(`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px">
        <h1>EcoScrap API</h1>
        <p>Backend is running. Admin UI is not built yet.</p>
        <p><a href="/api/health">/api/health</a></p>
        <p>Deploy build: <code>npm run build:admin</code> then restart.</p>
      </body></html>`);
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  const conn = await connectDB();
  if (!conn && process.env.NODE_ENV === "production") {
    // connectDB already logs + may exit; hard stop if still no DB
    console.error("Refusing to start without MongoDB in production");
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
