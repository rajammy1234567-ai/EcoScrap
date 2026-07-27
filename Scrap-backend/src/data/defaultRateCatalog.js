/** Default rate catalog seed (used when DB is empty) */
module.exports = [
  // IT-E Waste
  { key: "crt-monitor", name: "CRT Monitor", category: "IT-E Waste", rate_per_kg: 150, unit: "Unit", sort_order: 1 },
  { key: "printer-scanner-tv", name: "Printer / Scanner / LCD TV / LED TV", category: "IT-E Waste", rate_per_kg: 20, unit: "Kg", sort_order: 2 },
  { key: "crt-tv", name: "CRT TV", category: "IT-E Waste", rate_per_kg: 200, unit: "Unit", sort_order: 3 },
  { key: "laptop", name: "Laptop", category: "IT-E Waste", rate_per_kg: 500, unit: "Unit", sort_order: 4 },
  { key: "computer-cpu", name: "Computer CPU", category: "IT-E Waste", rate_per_kg: 400, unit: "Unit", sort_order: 5 },
  // Paper
  { key: "newspaper", name: "Newspaper", category: "Paper", rate_per_kg: 14, unit: "Kg", sort_order: 1 },
  { key: "cardboard", name: "Cardboard", category: "Paper", rate_per_kg: 7, unit: "Kg", sort_order: 2 },
  { key: "books-magazines", name: "Books / Magazines", category: "Paper", rate_per_kg: 10, unit: "Kg", sort_order: 3 },
  // Metal
  { key: "iron-steel", name: "Iron / Steel", category: "Metal", rate_per_kg: 28, unit: "Kg", sort_order: 1 },
  { key: "copper-wire", name: "Copper Wire", category: "Metal", rate_per_kg: 450, unit: "Kg", sort_order: 2 },
  { key: "aluminium", name: "Aluminium", category: "Metal", rate_per_kg: 200, unit: "Kg", sort_order: 3 },
  { key: "brass", name: "Brass", category: "Metal", rate_per_kg: 400, unit: "Kg", sort_order: 4 },
  // Large Appliances
  { key: "fridge", name: "Refrigerator / Fridge", category: "Large Appliances", rate_per_kg: 1000, unit: "Unit", sort_order: 1 },
  { key: "washing-machine", name: "Washing Machine", category: "Large Appliances", rate_per_kg: 800, unit: "Unit", sort_order: 2 },
  { key: "ac", name: "AC (Air Conditioner)", category: "Large Appliances", rate_per_kg: 2000, unit: "Unit", sort_order: 3 },
  { key: "cooker-stove", name: "Cooker / Gas Stove", category: "Large Appliances", rate_per_kg: 50, unit: "Unit", sort_order: 4 },
  // Clothes
  { key: "old-clothes", name: "Old Clothes / T-Shirts", category: "Clothes", rate_per_kg: 5, unit: "Kg", sort_order: 1 },
  // Glass
  { key: "glass-bottles", name: "Glass Bottles", category: "Glass", rate_per_kg: 2, unit: "Kg", sort_order: 1 },
];
