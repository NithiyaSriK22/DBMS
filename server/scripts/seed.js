const db = require('../config/db');

async function runSeed() {
  console.log('🔄 Resetting and reseeding relational database...');
  await db.init();
  await db.resetDatabase();
  console.log('✅ Database successfully reset and reseeded with 24+ species, habitats, locations, researchers, threats, and conservation programs.');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
