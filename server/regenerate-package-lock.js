// Script to regenerate package-lock.json
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Regenerating package-lock.json...');

try {
  // Remove existing package-lock.json
  const packageLockPath = path.join(__dirname, 'package-lock.json');
  if (fs.existsSync(packageLockPath)) {
    fs.unlinkSync(packageLockPath);
    console.log('✅ Removed existing package-lock.json');
  }

  // Remove node_modules
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    execSync('rmdir /s /q node_modules', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ Removed node_modules');
  }

  // Run npm install to regenerate package-lock.json
  execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
  console.log('✅ Regenerated package-lock.json');

} catch (error) {
  console.error('❌ Error regenerating package-lock.json:', error);
  process.exit(1);
}
