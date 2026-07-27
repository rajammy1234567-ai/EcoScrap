const mongoose = require('mongoose');
require('dotenv').config();

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
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await ensureUserIndexes();
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

module.exports = connectDB;
