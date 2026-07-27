// Public scrap categories + rate card (from DB catalog when available)
const rateCatalog = require("./rateCatalogController");

exports.getCategories = rateCatalog.getCategories;
exports.getItems = rateCatalog.getItems;
exports.getRateCard = rateCatalog.getRateCard;
