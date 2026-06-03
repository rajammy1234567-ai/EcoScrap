const mongoose = require('mongoose');

const scrapItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Paper/Newspaper', 'Iron/Metal', 'Plastic', 'Copper/Brass', 'E-Waste', 'Cardboard', 'Aluminium', 'Glass', 'Other'],
  },
  weight: { type: Number, required: true, min: 0.1 },
  estimatedPrice: { type: Number, min: 0 },
  images: [{ type: String }],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    fullAddress: String,
  },
  pickupDate: { type: Date },
  pickupSlot: { type: String, enum: ['Morning (8-12)', 'Afternoon (12-4)', 'Evening (4-8)'] },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'accepted', 'completed', 'rejected'],
    default: 'pending',
  },
  adminNote: { type: String },
  finalPrice: { type: Number, min: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('ScrapItem', scrapItemSchema);
