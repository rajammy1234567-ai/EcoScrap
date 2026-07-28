const dns = require('dns');
const mongoose = require('mongoose');
require('dotenv').config();

// Atlas SRV lookups often fail on some ISP DNS — use public resolvers first
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore
}

/**
 * Old unique email index (non-sparse) blocked multiple phone-only users.
 * Use partial unique indexes so empty/missing fields don't collide.
 */
async function ensureUserIndexes() {
  try {
    const col = mongoose.connection.collection('users');

    // Unset empty strings so they are not indexed
    await col.updateMany(
      { $or: [{ phone: '' }, { phone: null }] },
      { $unset: { phone: '' } },
    );
    await col.updateMany(
      { $or: [{ email: '' }, { email: null }] },
      { $unset: { email: '' } },
    );
    await col.updateMany(
      { $or: [{ googleId: '' }, { googleId: null }] },
      { $unset: { googleId: '' } },
    );

    // Phone users missing email → unique placeholder (avoids null email collision)
    const phoneOnly = await col
      .find({
        phone: { $type: 'string', $ne: '' },
        $or: [{ email: { $exists: false } }, { email: null }, { email: '' }],
      })
      .toArray();

    for (const u of phoneOnly) {
      const phone = String(u.phone).replace(/\D/g, '').slice(-10);
      if (phone.length !== 10) continue;
      await col
        .updateOne(
          { _id: u._id },
          { $set: { email: `phone_${phone}@phone.ecoscrap.local` } },
        )
        .catch(() => {});
    }

    const indexes = await col.indexes();
    for (const idx of indexes) {
      if (idx.name === '_id_') continue;
      const keys = Object.keys(idx.key || {});
      if (
        keys.length === 1 &&
        ['email', 'phone', 'googleId'].includes(keys[0]) &&
        !String(idx.name).includes('partial')
      ) {
        console.log(`Dropping old index: ${idx.name}`);
        await col.dropIndex(idx.name).catch(() => {});
      }
    }

    const partial = (field) => ({
      unique: true,
      name: `${field}_unique_partial`,
      partialFilterExpression: { [field]: { $type: 'string', $gt: '' } },
    });

    await col.createIndex({ email: 1 }, partial('email')).catch(() => {});
    await col.createIndex({ phone: 1 }, partial('phone')).catch(() => {});
    await col.createIndex({ googleId: 1 }, partial('googleId')).catch(() => {});
    console.log('User unique partial indexes ensured');
  } catch (err) {
    console.warn('Index ensure skipped:', err.message);
  }
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        'MONGODB_URI is not defined in environment variables. Please check your .env file or Render settings.',
      );
    }

    // Prefer a real DB name in URI: ...mongodb.net/ecoscrap?appName=...
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host} / db=${conn.connection.name}`);
    await ensureUserIndexes();
    return conn;
  } catch (err) {
    console.error(`MongoDB connection Error: ${err.message}`);
    console.error(
      '→ Fix: MongoDB Atlas → Network Access → Allow 0.0.0.0/0 (or your IP). Check MONGODB_URI password. Unpause free cluster if paused.',
    );
    // Don't keep serving API without DB — prevents "buffering timed out" on login
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB;
