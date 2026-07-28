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
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

function apiInfo() {
  const dbState = mongoose.connection.readyState;
  const dbLabel =
    ["disconnected", "connected", "connecting", "disconnecting"][dbState] ||
    "unknown";
  const hasUri = Boolean(
    process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.MONGODB_URL ||
      process.env.DATABASE_URL,
  );
  return {
    name: "EcoScrap API",
    base: "/api",
    status: dbState === 1 ? "OK" : "DEGRADED",
    mongo: dbLabel,
    mongodbUriConfigured: hasUri,
    timestamp: new Date(),
    health: "/api/health",
    adminPanel: "/admin",
    hint: hasUri
      ? dbState === 1
        ? null
        : "MONGODB_URI is set but DB not connected yet — check Atlas Network Access / password"
      : "MONGODB_URI missing on this Render service. Environment → Add MONGODB_URI → Save → Manual Deploy",
    endpoints: {
      auth: "/api/auth",
      health: "/api/health",
      pickups: "/api/v1/pickups",
      scrapper: "/api/v1/scrapper",
      location: "/api/v1/location",
      notifications: "/api/v1/notifications",
      scrap: "/api/v1/scrap",
      admin: "/api/admin",
    },
  };
}

// If DB down, return clear 503 on API (except health/info)
app.use("/api", (req, res, next) => {
  if (req.path === "/" || req.path === "" || req.path === "/health") {
    return next();
  }
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    success: false,
    message:
      "Database not connected. On Render set Environment variable MONGODB_URI for this web service, then redeploy.",
    ...apiInfo(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/scraps", scrapRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/v1/users/me/addresses", addressRoutes);
app.use("/api/v1/location", locationRoutes);
app.use("/api/v1/scrap", publicScrapRoutes);
app.use("/api/v1/pickups", pickupRoutes);
app.use("/api/v1/scrapper", scrapperRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.get(["/api", "/api/"], (_req, res) => {
  res.status(200).json(apiInfo());
});

app.get("/api/health", (_req, res) => {
  const info = apiInfo();
  res.status(info.status === "OK" ? 200 : 503).json({
    status: info.status,
    timestamp: info.timestamp,
    mongo: info.mongo,
    mongodbUriConfigured: info.mongodbUriConfigured,
    hint: info.hint,
  });
});

app.get("/", (_req, res) => {
  res.status(200).json(apiInfo());
});

// ── Admin panel at /admin ──
const adminDistCandidates = [
  path.join(__dirname, "public"),
  path.join(__dirname, "..", "Scrap-admin", "dist"),
];
const adminDist = adminDistCandidates.find((p) =>
  fs.existsSync(path.join(p, "index.html")),
);

if (adminDist) {
  console.log("Serving admin UI from:", adminDist, "→ /admin");
  app.get("/admin", (_req, res) => res.redirect(301, "/admin/"));
  app.use(
    "/admin",
    express.static(adminDist, {
      index: "index.html",
      fallthrough: true,
    }),
  );
  app.use("/admin", (req, res, next) => {
    res.sendFile(path.join(adminDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
} else {
  console.warn("Admin UI build not found");
  app.get(["/admin", "/admin/"], (_req, res) => {
    res
      .status(503)
      .type("html")
      .send(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px">
        <h1>Admin UI not built</h1>
        <p><a href="/api/health">/api/health</a></p>
      </body></html>`,
      );
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  console.log("Booting EcoScrap backend…");
  const conn = await connectDB();
  if (!conn) {
    console.error(
      "⚠️  Starting WITHOUT MongoDB — API will return 503 until MONGODB_URI is fixed on Render.",
    );
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API:  /api   health: /api/health   admin: /admin`);
  });
}

start().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
