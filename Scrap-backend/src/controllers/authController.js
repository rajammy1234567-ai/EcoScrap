const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const normalizePhone = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  // Keep last 10 digits (handles +91XXXXXXXXXX)
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
};

const isValidPhone = (phone) => /^\d{10}$/.test(phone);

/** Unique synthetic email so phone-only users don't collide on old email unique index */
const phonePlaceholderEmail = (phone10) =>
  `phone_${phone10}@phone.ecoscrap.local`;

/**
 * Find user by phone, or create phone-only account.
 * Never fails with "account already exists" for OTP flow.
 */
async function findOrCreatePhoneUser(normalizedPhone, name) {
  let user = await User.findOne({ phone: normalizedPhone });

  if (!user) {
    // Also match legacy synthetic / placeholder emails
    user = await User.findOne({
      email: phonePlaceholderEmail(normalizedPhone),
    });
  }

  if (user) {
    // Backfill phone / placeholder email if missing (fixes old bad rows)
    let dirty = false;
    if (!user.phone) {
      user.phone = normalizedPhone;
      dirty = true;
    }
    if (!user.email) {
      user.email = phonePlaceholderEmail(normalizedPhone);
      dirty = true;
    }
    if (name?.trim() && user.name === "New User") {
      user.name = name.trim();
      dirty = true;
    }
    if (dirty) {
      try {
        await user.save({ validateBeforeSave: false });
      } catch {
        // ignore backfill race
      }
    }
    return { user, isNewUser: false };
  }

  try {
    user = await User.create({
      name: name?.trim() || "New User",
      phone: normalizedPhone,
      email: phonePlaceholderEmail(normalizedPhone),
      password: Math.random().toString(36).slice(-12) + "Aa1",
      authProvider: "phone",
    });
    return { user, isNewUser: true };
  } catch (err) {
    // Race / duplicate: load existing and continue (OTP must still work)
    if (err.code === 11000) {
      user =
        (await User.findOne({ phone: normalizedPhone })) ||
        (await User.findOne({
          email: phonePlaceholderEmail(normalizedPhone),
        }));
      if (user) return { user, isNewUser: false };
    }
    throw err;
  }
}

async function issuePhoneOtp(user) {
  const otp = generateOtp();
  user.otpCode = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  return otp;
}

const sendEmail = async (to, subject, text, html) => {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const hasSmtpConfig = smtpUser && smtpPass;
  let transporter;
  let previewUrl;

  if (hasSmtpConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || smtpUser || "no-reply@ecoscrap.local",
    to,
    subject,
    text,
    html,
  });

  if (!hasSmtpConfig) {
    previewUrl = nodemailer.getTestMessageUrl(info);
  }

  return { info, previewUrl };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedPhone = phone ? normalizePhone(phone) : "";

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    // Email registration path
    if (email) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required for email registration",
        });
      }
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      let user = await User.findOne({ email: normalizedEmail });
      if (user && user.name !== "New User") {
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });
      }

      if (normalizedPhone && !isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }

      if (normalizedPhone) {
        const phoneTaken = await User.findOne({ phone: normalizedPhone });
        if (
          phoneTaken &&
          (!user || String(phoneTaken._id) !== String(user._id))
        ) {
          return res
            .status(400)
            .json({ success: false, message: "Phone already registered" });
        }
      }

      if (user) {
        user.name = name;
        user.password = password;
        user.authProvider = "email";
        if (normalizedPhone) user.phone = normalizedPhone;
        await user.save();
      } else {
        user = await User.create({
          name,
          email: normalizedEmail,
          password,
          phone: normalizedPhone || undefined,
          authProvider: "email",
        });
      }

      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user,
      });
    }

    // Phone-only registration (account created after OTP verify — this is fallback)
    if (normalizedPhone) {
      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }

      const { user } = await findOrCreatePhoneUser(normalizedPhone, name);
      if (user.name === "New User" || name) {
        user.name = name;
        user.authProvider = "phone";
        await user.save({ validateBeforeSave: false });
      }

      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Email or phone is required to create an account",
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res
        .status(400)
        .json({ success: false, message: `${field} already registered` });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    // Email + password login
    if (email) {
      if (!password) {
        return res
          .status(400)
          .json({ success: false, message: "Password is required" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user || !(await user.matchPassword(password))) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res
          .status(403)
          .json({ success: false, message: "Account deactivated" });
      }

      return res.json({
        success: true,
        token: generateToken(user._id),
        user,
      });
    }

    // Phone + password login (optional path)
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Use OTP login for phone, or provide password",
        });
      }

      const user = await User.findOne({ phone: normalizedPhone });
      if (!user || !(await user.matchPassword(password))) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid phone or password" });
      }

      if (!user.isActive) {
        return res
          .status(403)
          .json({ success: false, message: "Account deactivated" });
      }

      return res.json({
        success: true,
        token: generateToken(user._id),
        user,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Email or phone is required",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Send / generate OTP for email or phone.
 * For phone: OTP is returned in response so the app can show it in-app.
 * Existing numbers always get a fresh OTP (never "account already exists").
 */
exports.sendOtp = async (req, res) => {
  try {
    const { email, phone, name } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
      });
    }

    // ---- Phone OTP (in-app) ----
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits",
        });
      }

      const { user, isNewUser } = await findOrCreatePhoneUser(
        normalizedPhone,
        name,
      );
      const otp = await issuePhoneOtp(user);

      return res.json({
        success: true,
        message: "OTP generated. Enter it in the app to continue.",
        otp,
        is_new_user: isNewUser,
        channel: "phone",
        expires_in: 600,
      });
    }

    // ---- Email OTP ----
    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    const isNewUser = !user;

    if (!user) {
      try {
        user = await User.create({
          name: name?.trim() || "New User",
          email: normalizedEmail,
          password: Math.random().toString(36).slice(-12) + "Aa1",
          authProvider: "email",
        });
      } catch (err) {
        if (err.code === 11000) {
          user = await User.findOne({ email: normalizedEmail });
        } else {
          throw err;
        }
      }
    }

    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "Could not create or find user" });
    }

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const subject = "Your EcoScrap login OTP";
    const text = `Your OTP code is ${otp}. It expires in 10 minutes.`;
    const html = `<p>Your OTP code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`;

    let previewUrl;
    try {
      const result = await sendEmail(normalizedEmail, subject, text, html);
      previewUrl = result.previewUrl;
    } catch {
      // If email fails, still return OTP for app/dev use
    }

    return res.json({
      success: true,
      message: "OTP sent to email",
      otp,
      is_new_user: isNewUser,
      channel: "email",
      previewUrl,
      expires_in: 600,
    });
  } catch (err) {
    console.error("sendOtp error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate OTP",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, phone, otp, name } = req.body;

    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP is required" });
    }
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
      });
    }

    let user = null;

    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits",
        });
      }
      user = await User.findOne({ phone: normalizedPhone });
    } else {
      const normalizedEmail = email.trim().toLowerCase();
      user = await User.findOne({ email: normalizedEmail });
    }

    if (
      !user ||
      !user.otpCode ||
      user.otpCode !== String(otp).trim() ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const isNewUser = user.name === "New User";
    if (name?.trim() && isNewUser) {
      user.name = name.trim();
    }

    user.otpCode = undefined;
    user.otpExpires = undefined;
    if (phone) user.authProvider = "phone";
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      access_token: token,
      user,
      is_new_user: isNewUser && !name?.trim(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Continue with Google
 * Body: { email, name, googleId, idToken? }
 *
 * Dev: dummy Client IDs / idTokens accepted when GOOGLE_REQUIRE_VALID_ID_TOKEN != true
 * Prod: set real GOOGLE_WEB_CLIENT_ID + GOOGLE_REQUIRE_VALID_ID_TOKEN=true
 *       and verify idToken with google-auth-library (optional next step)
 */
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, idToken } = req.body;

    if (!googleId && !email) {
      return res.status(400).json({
        success: false,
        message: "Google account info is required",
      });
    }

    const requireValidToken =
      process.env.GOOGLE_REQUIRE_VALID_ID_TOKEN === "true";
    const webClientId = process.env.GOOGLE_WEB_CLIENT_ID || "";
    const isDummyGoogleConfig =
      !webClientId ||
      webClientId.includes("dummy") ||
      webClientId.includes("REPLACE") ||
      webClientId.includes("XXXX");

    if (requireValidToken && !isDummyGoogleConfig) {
      if (!idToken || String(idToken).startsWith("dummy-id-token")) {
        return res.status(401).json({
          success: false,
          message: "Valid Google idToken is required",
        });
      }
      // TODO: verify idToken with google-auth-library against GOOGLE_WEB_CLIENT_ID
      // when you switch off dummy keys in production.
    }

    const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
    let user = null;

    if (googleId) {
      user = await User.findOne({ googleId });
    }
    if (!user && normalizedEmail) {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (user) {
      if (!user.isActive) {
        return res
          .status(403)
          .json({ success: false, message: "Account deactivated" });
      }
      if (googleId && !user.googleId) {
        user.googleId = googleId;
      }
      if (name?.trim() && user.name === "New User") {
        user.name = name.trim();
      }
      user.authProvider = "google";
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        name: name?.trim() || "Google User",
        email: normalizedEmail,
        googleId: googleId || undefined,
        password: Math.random().toString(36).slice(-12) + "Aa1",
        authProvider: "google",
      });
    }

    return res.json({
      success: true,
      token: generateToken(user._id),
      user,
      is_new_user: false,
      google_mode: isDummyGoogleConfig ? "dummy" : "live",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This Google account is already linked",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) {
      const normalizedPhone = normalizePhone(phone);
      if (normalizedPhone && !isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }
      updates.phone = normalizedPhone || undefined;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePushToken = async (req, res) => {
  try {
    const { pushToken, fcmToken, platform } = req.body;
    const updates = {};
    if (pushToken !== undefined) updates.pushToken = pushToken;
    if (fcmToken !== undefined) updates.fcmToken = fcmToken;
    if (platform !== undefined) updates.devicePlatform = platform;

    await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
