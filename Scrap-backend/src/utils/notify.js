const User = require("../models/User");
const Notification = require("../models/Notification");

const sendExpoPush = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !String(pushToken).startsWith("ExponentPushToken")) return;
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data,
        sound: "default",
        priority: "high",
      }),
    });
  } catch {
    // ignore push failures
  }
};

/**
 * Create in-app notification + optional Expo push
 */
async function notifyUser({
  userId,
  title,
  body,
  type = "general",
  reason,
  data = {},
}) {
  const notification = await Notification.create({
    user: userId,
    title,
    body,
    type,
    reason,
    data,
  });

  const user = await User.findById(userId).select("pushToken");
  if (user?.pushToken) {
    await sendExpoPush(user.pushToken, title, body, {
      ...data,
      notificationId: String(notification._id),
      type,
    });
  }

  return notification;
}

module.exports = { sendExpoPush, notifyUser };
