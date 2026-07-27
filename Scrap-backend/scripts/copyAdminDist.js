/**
 * Copy Scrap-admin/dist → Scrap-backend/public for Express static serve.
 */
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "..", "Scrap-admin", "dist");
const dest = path.join(__dirname, "..", "public");

function copyRecursive(from, to) {
  if (!fs.existsSync(from)) {
    console.error("Admin dist not found:", from);
    console.error("Run: npm run build --prefix ../Scrap-admin");
    process.exit(1);
  }
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });

  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.cpSync(s, d, { recursive: true });
    } else {
      fs.copyFileSync(s, d);
    }
  }
  console.log("Copied admin UI →", dest);
}

copyRecursive(src, dest);
