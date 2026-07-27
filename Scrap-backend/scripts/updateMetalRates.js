require("dotenv").config();
const mongoose = require("mongoose");
const RateCatalogItem = require("../src/models/RateCatalogItem");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  await RateCatalogItem.updateOne(
    { key: "aluminium" },
    {
      $set: {
        key: "aluminium",
        name: "Aluminium",
        category: "Metal",
        rate_per_kg: 200,
        unit: "Kg",
        sort_order: 3,
        isActive: true,
      },
      $setOnInsert: { image_url: null },
    },
    { upsert: true },
  );
  await RateCatalogItem.updateOne(
    { key: "brass" },
    {
      $set: {
        key: "brass",
        name: "Brass",
        category: "Metal",
        rate_per_kg: 400,
        unit: "Kg",
        sort_order: 4,
        isActive: true,
      },
      $setOnInsert: { image_url: null },
    },
    { upsert: true },
  );
  const items = await RateCatalogItem.find({
    key: { $in: ["aluminium", "brass", "iron-steel", "copper-wire"] },
  }).sort({ sort_order: 1 });
  for (const i of items) {
    console.log(`${i.name}: ₹${i.rate_per_kg}/${i.unit}`);
  }
  await mongoose.disconnect();
  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
