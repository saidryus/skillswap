/**
 * FULL DATABASE WIPE
 * Deletes ALL data from all collections. Use before re-seeding.
 * 
 * Usage: node truncate.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function truncate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const collections = await mongoose.connection.db.listCollections().toArray();
  
  for (const col of collections) {
    await mongoose.connection.db.collection(col.name).deleteMany({});
    console.log(`  ✗ ${col.name} — cleared`);
  }

  console.log(`\n✅ Full wipe complete. ${collections.length} collections emptied.`);
  console.log('Run "node seed.js" to re-populate with fresh data.');
  
  process.exit(0);
}

truncate().catch((err) => { console.error(err); process.exit(1); });
