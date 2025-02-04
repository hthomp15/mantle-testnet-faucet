const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigrations() {
  try {
    const initPath = path.join(__dirname, 'init');
    const files = fs.readdirSync(initPath)
      .sort((a, b) => a.localeCompare(b)); // Ensure files are run in order

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(initPath, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        console.log(`Running migration: ${file}`);
        await db.query(sql);
        console.log(`Completed migration: ${file}`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await db.pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runMigrations; 