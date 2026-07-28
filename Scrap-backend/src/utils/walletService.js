const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    try {
      wallet = await Wallet.create({ user: userId, balance: 0 });
    } catch (err) {
      // race
      if (err.code === 11000) {
        wallet = await Wallet.findOne({ user: userId });
      } else throw err;
    }
  }
  return wallet;
}

/**
 * Credit wallet (optimistic concurrency on balance field).
 */
async function creditWallet({
  userId,
  amount,
  category,
  description,
  performedBy,
  pickup,
  payout,
  meta,
}) {
  if (!amount || amount <= 0) throw new Error("Credit amount must be > 0");
  const amt = Math.round(Number(amount) * 100) / 100;

  await getOrCreateWallet(userId);

  const wallet = await Wallet.findOneAndUpdate(
    { user: userId, isFrozen: { $ne: true } },
    {
      $inc: { balance: amt, totalCredited: amt },
    },
    { new: true },
  );

  if (!wallet) {
    const existing = await Wallet.findOne({ user: userId });
    if (existing?.isFrozen) {
      throw new Error(existing.frozenReason || "Wallet is frozen");
    }
    throw new Error("Could not credit wallet");
  }

  // fix float drift
  wallet.balance = Math.round(wallet.balance * 100) / 100;
  wallet.totalCredited = Math.round(wallet.totalCredited * 100) / 100;
  await wallet.save();

  const transaction = await WalletTransaction.create({
    wallet: wallet._id,
    user: userId,
    type: "credit",
    category,
    amount: amt,
    balanceAfter: wallet.balance,
    description,
    performedBy,
    pickup,
    payout,
    meta,
  });

  return { wallet, transaction };
}

/**
 * Debit with balance check (atomic conditional update).
 */
async function debitWallet({
  userId,
  amount,
  category,
  description,
  performedBy,
  pickup,
  payout,
  meta,
}) {
  if (!amount || amount <= 0) throw new Error("Debit amount must be > 0");
  const amt = Math.round(Number(amount) * 100) / 100;

  const wallet = await Wallet.findOneAndUpdate(
    {
      user: userId,
      isFrozen: { $ne: true },
      balance: { $gte: amt },
    },
    {
      $inc: { balance: -amt, totalDebited: amt },
    },
    { new: true },
  );

  if (!wallet) {
    const existing = await Wallet.findOne({ user: userId });
    if (!existing) throw new Error("Wallet not found");
    if (existing.isFrozen) {
      throw new Error(existing.frozenReason || "Wallet is frozen");
    }
    throw new Error(
      `Insufficient wallet balance. Available ₹${existing.balance}, required ₹${amt}`,
    );
  }

  wallet.balance = Math.round(wallet.balance * 100) / 100;
  wallet.totalDebited = Math.round(wallet.totalDebited * 100) / 100;
  await wallet.save();

  const transaction = await WalletTransaction.create({
    wallet: wallet._id,
    user: userId,
    type: "debit",
    category,
    amount: amt,
    balanceAfter: wallet.balance,
    description,
    performedBy,
    pickup,
    payout,
    meta,
  });

  return { wallet, transaction };
}

module.exports = {
  getOrCreateWallet,
  creditWallet,
  debitWallet,
};
