/**
 * Admin Razorpay / RazorpayX helpers.
 * Env:
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 *   RAZORPAY_ACCOUNT_NUMBER  (RazorpayX current account number for payouts)
 *   RAZORPAY_PAYOUTS_ENABLED=true
 *
 * Without RazorpayX config, payouts are recorded in wallet only (safe offline mode).
 */

let Razorpay = null;
try {
  Razorpay = require("razorpay");
} catch {
  // optional dependency edge case
}

function getConfig() {
  const key_id = process.env.RAZORPAY_KEY_ID || "";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
  const account_number = process.env.RAZORPAY_ACCOUNT_NUMBER || "";
  const payoutsEnabled =
    String(process.env.RAZORPAY_PAYOUTS_ENABLED || "").toLowerCase() === "true";
  return {
    key_id,
    key_secret,
    account_number,
    payoutsEnabled,
    configured: !!(key_id && key_secret),
    canPayout: !!(key_id && key_secret && account_number && payoutsEnabled),
  };
}

function getClient() {
  const cfg = getConfig();
  if (!cfg.configured || !Razorpay) return null;
  return new Razorpay({
    key_id: cfg.key_id,
    key_secret: cfg.key_secret,
  });
}

/**
 * Attempt UPI payout via RazorpayX.
 * Returns { success, mode, razorpayPayoutId, contactId, fundAccountId, raw, error }
 */
async function createUpiPayout({
  amountInr,
  upiId,
  name,
  referenceId,
  notes = {},
}) {
  const cfg = getConfig();
  if (!cfg.canPayout) {
    return {
      success: false,
      mode: "wallet_only",
      error:
        "RazorpayX payouts not configured. Payment recorded on wallet only.",
    };
  }

  const client = getClient();
  if (!client) {
    return {
      success: false,
      mode: "wallet_only",
      error: "Razorpay SDK unavailable",
    };
  }

  try {
    // 1) Contact
    const contact = await client.contacts.create({
      name: name || "Customer",
      type: "customer",
      reference_id: String(referenceId).slice(0, 40),
      notes,
    });

    // 2) Fund account (VPA)
    const fundAccount = await client.fundAccount.create({
      contact_id: contact.id,
      account_type: "vpa",
      vpa: { address: upiId },
    });

    // 3) Payout (amount in paise)
    const amountPaise = Math.round(Number(amountInr) * 100);
    const payout = await client.payouts.create({
      account_number: cfg.account_number,
      fund_account_id: fundAccount.id,
      amount: amountPaise,
      currency: "INR",
      mode: "UPI",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: String(referenceId).slice(0, 40),
      narration: "EcoScrap pickup payment",
      notes,
    });

    return {
      success: true,
      mode: "razorpay_payout",
      razorpayPayoutId: payout.id,
      contactId: contact.id,
      fundAccountId: fundAccount.id,
      raw: payout,
      status: payout.status,
    };
  } catch (err) {
    const message =
      err?.error?.description ||
      err?.message ||
      "Razorpay payout failed";
    return {
      success: false,
      mode: "razorpay_failed",
      error: message,
      raw: err?.error || err,
    };
  }
}

function publicStatus() {
  const cfg = getConfig();
  return {
    configured: cfg.configured,
    payoutsEnabled: cfg.canPayout,
    keyIdPreview: cfg.key_id
      ? `${cfg.key_id.slice(0, 8)}…`
      : null,
  };
}

module.exports = {
  getConfig,
  getClient,
  createUpiPayout,
  publicStatus,
};
