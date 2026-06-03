const ScrapItem = require('../models/ScrapItem');

exports.createScrap = async (req, res) => {
  try {
    const { title, description, category, weight, estimatedPrice, address, pickupDate, pickupSlot } = req.body;
    if (!title || !category || !weight)
      return res.status(400).json({ success: false, message: 'Title, category and weight are required' });

    const scrap = await ScrapItem.create({
      title, description, category, weight, estimatedPrice,
      address, pickupDate, pickupSlot,
      user: req.user._id,
    });
    res.status(201).json({ success: true, scrap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserScraps = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const total = await ScrapItem.countDocuments(filter);
    const scraps = await ScrapItem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, scraps, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getScrapById = async (req, res) => {
  try {
    const scrap = await ScrapItem.findById(req.params.id).populate('user', 'name email phone');
    if (!scrap) return res.status(404).json({ success: false, message: 'Scrap item not found' });
    if (scrap.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, scrap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateScrap = async (req, res) => {
  try {
    const scrap = await ScrapItem.findById(req.params.id);
    if (!scrap) return res.status(404).json({ success: false, message: 'Scrap item not found' });
    if (scrap.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (scrap.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Only pending requests can be edited' });

    const { title, description, category, weight, estimatedPrice, address, pickupDate, pickupSlot } = req.body;
    Object.assign(scrap, { title, description, category, weight, estimatedPrice, address, pickupDate, pickupSlot });
    await scrap.save();
    res.json({ success: true, scrap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteScrap = async (req, res) => {
  try {
    const scrap = await ScrapItem.findById(req.params.id);
    if (!scrap) return res.status(404).json({ success: false, message: 'Scrap item not found' });
    if (scrap.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (!['pending', 'rejected'].includes(scrap.status))
      return res.status(400).json({ success: false, message: 'Cannot delete this request' });
    await scrap.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
