const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

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
    from:
      process.env.EMAIL_FROM ||
      smtpUser ||
      "no-reply@ecoscrap.local",
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
    if (!name || !email || !password)
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email and password are required",
        });

    let user = await User.findOne({ email });
    if (user && user.name !== "New User")
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    if (user) {
      user.name = name;
      user.password = password;
      if (phone) user.phone = phone;
      await user.save();
    } else {
      user = await User.create({ name, email, password, phone });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    if (!user.isActive)
      return res
        .status(403)
        .json({ success: false, message: "Account deactivated" });

    res.json({
      success: true,
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    const isNewUser = !user;

    if (!user) {
      user = await User.create({
        name: "New User",
        email: normalizedEmail,
        password: Math.random().toString(36).slice(-12),
      });
    }

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const subject = "Your EcoScrap login OTP";
    const text = `Your OTP code is ${otp}. It expires in 10 minutes.`;
    const html = `<p>Your OTP code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`;
    const { previewUrl } = await sendEmail(
      normalizedEmail,
      subject,
      text,
      html,
    );

    res.json({
      success: true,
      message: "OTP sent to email",
      is_new_user: isNewUser,
      previewUrl,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (
      !user ||
      !user.otpCode ||
      user.otpCode !== otp ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      access_token: generateToken(user._id),
      is_new_user: user.name === "New User",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true },
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { pushToken });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
