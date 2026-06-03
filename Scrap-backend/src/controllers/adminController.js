const ScrapItem = require('../models/ScrapItem');
const User = require('../models/User');

const sendExpoPush = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !pushToken.startsWith('ExponentPushToken')) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ to: pushToken, title, body, data, sound: 'default', priority: 'high' }),
    });
  } catch {}
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [total, pending, in_review, accepted, completed, rejected, totalUsers] = await Promise.all([
      ScrapItem.countDocuments(),
      ScrapItem.countDocuments({ status: 'pending' }),
      ScrapItem.countDocuments({ status: 'in_review' }),
      ScrapItem.countDocuments({ status: 'accepted' }),
      ScrapItem.countDocuments({ status: 'completed' }),
      ScrapItem.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: 'user' }),
    ]);

    const revenueAgg = await ScrapItem.aggregate([
      { $match: { status: 'completed', finalPrice: { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$finalPrice' } } },
    ]);

    res.json({
      success: true,
      stats: {
        total, pending, in_review, accepted, completed, rejected,
        totalUsers,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllScraps = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await ScrapItem.countDocuments(filter);
    const scraps = await ScrapItem.find(filter)
      .populate('user', 'name email phone')
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
    const scrap = await ScrapItem.findById(req.params.id).populate('user', 'name email phone address');
    if (!scrap) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, scrap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateScrapStatus = async (req, res) => {
  try {
    const { status, adminNote, finalPrice, pickupDate, pickupSlot } = req.body;
    const validStatuses = ['pending', 'in_review', 'accepted', 'completed', 'rejected'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const scrap = await ScrapItem.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, finalPrice, pickupDate, pickupSlot },
      { new: true }
    ).populate('user', 'name email phone');

    if (!scrap) return res.status(404).json({ success: false, message: 'Not found' });

    const user = await User.findById(scrap.user._id);
    if (user?.pushToken) {
      const statusMessages = {
        in_review: 'Your request is being reviewed by our team.',
        accepted: `Great news! Your pickup has been accepted.${finalPrice ? ` Price: ₹${finalPrice}` : ''}`,
        completed: `Pickup completed! You earned ₹${finalPrice || 0}. Thank you!`,
        rejected: `Your request was not accepted. ${adminNote || ''}`,
      };
      const msg = statusMessages[status];
      if (msg) await sendExpoPush(user.pushToken, `Update: ${scrap.title}`, msg, { scrapId: String(scrap._id) });
    }

    res.json({ success: true, scrap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    const user = await User.findById(userId);
    if (!user?.pushToken) return res.status(400).json({ success: false, message: 'User has no push token' });
    await sendExpoPush(user.pushToken, title, body);
    res.json({ success: true, message: 'Notification sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await User.countDocuments({ role: 'user' });
    const users = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists' });
    const admin = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ success: true, user: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
