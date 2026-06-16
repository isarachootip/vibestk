const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const standaloneDir = path.join(rootDir, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.error('Error: .next/standalone directory not found. Please run "npm run build" first.');
  process.exit(1);
}

console.log('Copying public folder to standalone...');
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log('Copied public folder.');
} else {
  console.log('No public folder found.');
}

console.log('Copying .next/static folder to standalone...');
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log('Copied .next/static folder.');
} else {
  console.log('No .next/static folder found.');
}

console.log('Copying .env.production as .env to standalone...');
const envSrc = path.join(rootDir, '.env.production');
const envDest = path.join(standaloneDir, '.env');
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log('Copied .env.production as .env.');
} else {
  console.log('.env.production not found, skipping.');
}

console.log('Creating deployment zip (hostinger_deploy.zip)...');
const zipPath = path.join(rootDir, 'hostinger_deploy.zip');

// Remove existing zip if it exists
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

try {
  // Use PowerShell to zip files (using -Force and pipe to include hidden files like .next and .env)
  execSync('powershell -Command "Get-ChildItem -Path .next/standalone -Force | Compress-Archive -DestinationPath hostinger_deploy.zip -Force"', {
    stdio: 'inherit'
  });
  console.log('Successfully created hostinger_deploy.zip!');
} catch (error) {
  console.error('Error creating zip file:', error);
  process.exit(1);
}
