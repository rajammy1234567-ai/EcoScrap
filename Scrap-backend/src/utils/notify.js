const User = require("../models/User");
const Notification = require("../models/Notification");

/**
 * Expo Push → FCM (Android) / APNs (iOS)
 * Android production needs google-services.json in the app build +
 * FCM V1 credentials uploaded on Expo dashboard for the EAS project.
 */
const sendExpoPush = async (pushTokenOrTokens, title, body, data = {}) => {
  const tokens = Array.isArray(pushTokenOrTokens)
    ? pushTokenOrTokens.filter(Boolean)
    : [pushTokenOrTokens];

  if (!tokens.length) return;

  const normalizedTokens = tokens.filter(
    (token) => token && String(token).trim(),
  );
  if (!normalizedTokens.length) return;

  const requests = normalizedTokens.map(async (pushToken) => {
    if (!String(pushToken).startsWith("ExponentPushToken")) return;
    try {
      const type = data?.type || "general";
      const channelId =
        type === "pickup_nearby"
          ? "pickup_nearby"
          : type === "pickup_update" || type === "pickup_assigned"
            ? "pickup_update"
            : "default";

      const res = await fetch("https://exp.host/--/api/v2/push/send", {
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
          channelId,
          _contentAvailable: true,
        }),
      });
      if (!res.ok && process.env.NODE_ENV !== "production") {
        const text = await res.text().catch(() => "");
        console.warn("Expo push HTTP", res.status, text.slice(0, 200));
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Expo push failed", err?.message);
      }
    }
  });

  await Promise.allSettled(requests);
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
