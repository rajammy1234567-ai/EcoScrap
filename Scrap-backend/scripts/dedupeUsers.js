require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('users');

  const all = await col
    .find({ phone: { $type: 'string', $ne: '' } })
    .toArray();
  const byPhone = {};
  for (const u of all) {
    const p = String(u.phone).replace(/\D/g, '').slice(-10);
    if (!p) continue;
    if (!byPhone[p]) byPhone[p] = [];
    byPhone[p].push(u);
  }
  for (const [p, list] of Object.entries(byPhone)) {
    if (list.length < 2) continue;
    console.log('DUP phone', p, 'count', list.length);
    list.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
    for (let i = 1; i < list.length; i++) {
      await col.updateOne({ _id: list[i]._id }, { $unset: { phone: '' } });
      console.log('unset phone on', list[i]._id);
    }
  }

  const allE = await col
    .find({ email: { $type: 'string', $ne: '' } })
    .toArray();
  const byE = {};
  for (const u of allE) {
    const e = String(u.email).toLowerCase();
    if (!byE[e]) byE[e] = [];
    byE[e].push(u);
  }
  for (const [e, list] of Object.entries(byE)) {
    if (list.length < 2) continue;
    console.log('DUP email', e, list.length);
    list.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
    for (let i = 1; i < list.length; i++) {
      await col.updateOne(
        { _id: list[i]._id },
        { $set: { email: `dup_${list[i]._id}@fixed.local` } },
      );
    }
  }

  console.log('dedupe done');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
