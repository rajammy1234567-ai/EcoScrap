
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');
  await mongoose.connect(uri);
  const col = mongoose.connection.collection('users');

  // Empty string breaks unique sparse indexes — unset them
  const phoneClean = await col.updateMany(
    { $or: [{ phone: '' }, { phone: null }] },
    { $unset: { phone: '' } },
  );
  const emailClean = await col.updateMany(
    { $or: [{ email: '' }, { email: null }] },
    { $unset: { email: '' } },
  );
  const googleClean = await col.updateMany(
    { $or: [{ googleId: '' }, { googleId: null }] },
    { $unset: { googleId: '' } },
  );
  console.log('Cleaned empty fields:', {
    phone: phoneClean.modifiedCount,
    email: emailClean.modifiedCount,
    googleId: googleClean.modifiedCount,
  });

  // Assign unique placeholder emails to phone-only users without email
  const phoneOnly = await col
    .find({
      phone: { $type: 'string', $ne: '' },
      $or: [{ email: { $exists: false } }, { email: null }, { email: '' }],
    })
    .toArray();

  for (const u of phoneOnly) {
    const phone = String(u.phone).replace(/\D/g, '').slice(-10);
    if (phone.length !== 10) continue;
    const email = `phone_${phone}@phone.ecoscrap.local`;
    try {
      await col.updateOne({ _id: u._id }, { $set: { email } });
      console.log('Set placeholder email for phone', phone);
    } catch (e) {
      console.warn('Skip user', u._id, e.message);
    }
  }

  const indexes = await col.indexes();
  for (const idx of indexes) {
    if (idx.name === '_id_') continue;
    const keys = Object.keys(idx.key || {});
    if (
      keys.length === 1 &&
      ['email', 'phone', 'googleId'].includes(keys[0])
    ) {
      console.log('Dropping index', idx.name);
      await col.dropIndex(idx.name).catch((e) => console.warn(e.message));
    }
  }

  // partialFilterExpression is safer than sparse for unique phone/email
  await col.createIndex(
    { email: 1 },
    {
      unique: true,
      name: 'email_unique_partial',
      partialFilterExpression: {
        email: { $type: 'string', $gt: '' },
      },
    },
  );
  await col.createIndex(
    { phone: 1 },
    {
      unique: true,
      name: 'phone_unique_partial',
      partialFilterExpression: {
        phone: { $type: 'string', $gt: '' },
      },
    },
  );
  await col.createIndex(
    { googleId: 1 },
    {
      unique: true,
      name: 'googleId_unique_partial',
      partialFilterExpression: {
        googleId: { $type: 'string', $gt: '' },
      },
    },
  );

  console.log('Indexes OK:', await col.indexes());
  await mongoose.disconnect();
  console.log('Done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
