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

/** Resolve Mongo URI from common env names; strip accidental quotes. */
function resolveMongoUri() {
  const raw =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URL ||
    '';
  return String(raw).trim().replace(/^["']|["']$/g, '');
}

function logEnvDiagnostics() {
  const allKeys = Object.keys(process.env).sort();
  const mongoLike = allKeys.filter((k) => /mongo|database|^db_/i.test(k));
  const important = allKeys.filter((k) =>
    /mongo|jwt|node_env|port|render/i.test(k),
  );
  console.log('── Env diagnostics (names only, no secrets) ──');
  console.log('NODE_ENV =', process.env.NODE_ENV || '(unset)');
  console.log('PORT =', process.env.PORT || '(unset)');
  console.log('MONGODB_URI set?', Boolean(process.env.MONGODB_URI));
  console.log('MONGO_URI set?', Boolean(process.env.MONGO_URI));
  console.log('MONGODB_URL set?', Boolean(process.env.MONGODB_URL));
  console.log('DATABASE_URL set?', Boolean(process.env.DATABASE_URL));
  console.log(
    'mongo-like keys:',
    mongoLike.length ? mongoLike.join(', ') : '(none)',
  );
  console.log(
    'important keys:',
    important.length ? important.join(', ') : '(none)',
  );
  console.log('total env keys count:', allKeys.length);
  console.log('────────────────────────────────────────────');
}

const connectDB = async () => {
  logEnvDiagnostics();

  try {
    const uri = resolveMongoUri();
    if (!uri) {
      console.error(
        '❌ No Mongo connection string found in process.env.\n' +
          '   On Render: open THIS web service → Environment → add key exactly:\n' +
          '   MONGODB_URI = mongodb+srv://USER:PASS@cluster.../dbname?retryWrites=true&w=majority\n' +
          '   Then Save + Manual Deploy. Local .env is never uploaded to Render.',
      );
      throw new Error(
        'MONGODB_URI is not defined in environment variables. Please check your .env file or Render settings.',
      );
    }

    // Log host only (never password)
    try {
      const safe = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
      console.log('Connecting MongoDB:', safe.split('?')[0]);
    } catch {
      // ignore
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log(
      `✅ MongoDB Connected: ${conn.connection.host} / db=${conn.connection.name}`,
    );
    await ensureUserIndexes();
    return conn;
  } catch (err) {
    console.error(`MongoDB connection Error: ${err.message}`);
    console.error(
      '→ Fix: Render Environment MONGODB_URI + Atlas Network Access 0.0.0.0/0 + unpause cluster',
    );
    // Do NOT process.exit here — server can still serve /api health diagnostics
    return null;
  }
};

module.exports = connectDB;
