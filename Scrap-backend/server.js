require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const errorHandler = require("./src/middlewares/errorHandler");
const authRoutes = require("./src/routes/authRoutes");
const scrapRoutes = require("./src/routes/scrapRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const addressRoutes = require("./src/routes/addressRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const publicScrapRoutes = require("./src/routes/publicScrapRoutes");
const pickupRoutes = require("./src/routes/pickupRoutes");
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: true, limit: "6mb" }));

// ── API routes ──
app.use("/api/auth", authRoutes);
app.use("/api/scraps", scrapRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/v1/users/me/addresses", addressRoutes);
app.use("/api/v1/location", locationRoutes);
app.use("/api/v1/scrap", publicScrapRoutes);
app.use("/api/v1/pickups", pickupRoutes);
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", timestamp: new Date() }),
);

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
