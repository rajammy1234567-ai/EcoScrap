require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/database");
const errorHandler = require("./src/middlewares/errorHandler");
const authRoutes = require("./src/routes/authRoutes");
const scrapRoutes = require("./src/routes/scrapRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const addressRoutes = require("./src/routes/addressRoutes");
const publicScrapRoutes = require("./src/routes/publicScrapRoutes");
const pickupRoutes = require("./src/routes/pickupRoutes");
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/scraps", scrapRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/v1/users/me/addresses", addressRoutes);
app.use("/api/v1/scrap", publicScrapRoutes);
app.use("/api/v1/pickups", pickupRoutes);
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", timestamp: new Date() }),
);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
