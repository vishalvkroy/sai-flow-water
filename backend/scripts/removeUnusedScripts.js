const fs = require('fs');
const path = require('path');

console.log('🧹 Removing Unnecessary Script Files...\n');

const scriptsDir = __dirname;

// Scripts to KEEP (essential for maintenance)
const keepScripts = [
  'fullCleanup.js',
  'createSeller.js',
  'addProducts.js',
  'removeUnusedScripts.js' // This script itself
];

// Get all files in scripts directory
const allFiles = fs.readdirSync(scriptsDir);
const scriptFiles = allFiles.filter(f => f.endsWith('.js'));

console.log(`📂 Found ${scriptFiles.length} script files\n`);

let deletedCount = 0;
let keptCount = 0;

scriptFiles.forEach(file => {
  if (keepScripts.includes(file)) {
    console.log(`✅ Keeping: ${file}`);
    keptCount++;
  } else {
    const filePath = path.join(scriptsDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted: ${file}`);
      deletedCount++;
    } catch (error) {
      console.log(`❌ Failed to delete: ${file} - ${error.message}`);
    }
  }
});

console.log('\n═══════════════════════════════════════');
console.log('✨ CLEANUP COMPLETE!');
console.log('═══════════════════════════════════════');
console.log(`✅ Kept: ${keptCount} essential scripts`);
console.log(`🗑️  Deleted: ${deletedCount} unnecessary scripts`);
console.log('═══════════════════════════════════════\n');
