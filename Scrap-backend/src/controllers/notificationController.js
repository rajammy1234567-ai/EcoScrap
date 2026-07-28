const Notification = require("../models/Notification");

const normalize = (doc) => {
  if (!doc) return null;
  const out = doc.toObject ? doc.toObject() : { ...doc };
  out.id = out._id;
  return out;
};

exports.listNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 30, unreadOnly } = req.query;
    const filter = { user: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      notifications: notifications.map(normalize),
      total,
      unreadCount,
      page: Number(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true },
    );
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, notification: normalize(notification) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
