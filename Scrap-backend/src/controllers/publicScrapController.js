// Minimal public controller to serve categories and items for the frontend
const FALLBACK_CATS = [
  { id: "paper", name: "Paper", icon_url: null, sort_order: 1 },
  { id: "metal", name: "Metals", icon_url: null, sort_order: 2 },
  { id: "ewaste", name: "E-Waste", icon_url: null, sort_order: 3 },
  { id: "carton", name: "Cartons / Plastics", icon_url: null, sort_order: 4 },
  { id: "others", name: "Others", icon_url: null, sort_order: 5 },
  { id: "appliance", name: "Big Appliances", icon_url: null, sort_order: 6 },
];

// Sample items per category (minimal), each item has an id and name
const SAMPLE_ITEMS = {
  paper: [
    { id: "paper-1", name: "Newspaper" },
    { id: "paper-2", name: "Books" },
  ],
  metal: [
    { id: "metal-1", name: "Iron" },
    { id: "metal-2", name: "Copper" },
  ],
  ewaste: [
    { id: "ewaste-1", name: "Laptop" },
    { id: "ewaste-2", name: "Phone" },
  ],
  carton: [
    { id: "carton-1", name: "Cardboard" },
    { id: "carton-2", name: "Plastic Bottles" },
  ],
  others: [{ id: "others-1", name: "Battery" }],
  appliance: [{ id: "appliance-1", name: "Fridge" }],
};

exports.getCategories = async (req, res) => {
  res.json({ success: true, categories: FALLBACK_CATS });
};

exports.getItems = async (req, res) => {
  const { id } = req.params;
  const items = SAMPLE_ITEMS[id] ?? [];
  res.json({ success: true, items });
};
