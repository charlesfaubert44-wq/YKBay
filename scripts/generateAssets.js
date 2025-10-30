/**
 * Asset Generator for True North Navigator
 * Generates PNG icons, favicons, and social preview from SVG logos
 */

const fs = require('fs');
const path = require('path');

// Required sizes for PWA icons
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Required favicon sizes
const faviconSizes = [16, 32];

console.log('\n🎨 True North Navigator - Asset Generator\n');
console.log('=========================================\n');

// Check if logo files exist
const logoPath = path.join(__dirname, '../client/public/logo-icon.svg');
const logoExists = fs.existsSync(logoPath);

if (!logoExists) {
  console.error('❌ Error: logo-icon.svg not found at:', logoPath);
  process.exit(1);
}

console.log('✓ Found logo-icon.svg\n');

// Instructions for manual generation
console.log('📋 MANUAL ASSET GENERATION INSTRUCTIONS\n');
console.log('Since we\'re in a Node.js environment without image processing libraries,');
console.log('please use one of these methods to generate PNG assets:\n');

console.log('─────────────────────────────────────────────────────────────');
console.log('OPTION 1: Online Tool (Easiest)');
console.log('─────────────────────────────────────────────────────────────');
console.log('1. Visit: https://realfavicongenerator.net/');
console.log('2. Upload: client/public/logo-icon.svg');
console.log('3. Download generated files');
console.log('4. Extract to: client/public/\n');

console.log('─────────────────────────────────────────────────────────────');
console.log('OPTION 2: PWA Asset Generator (Best)');
console.log('─────────────────────────────────────────────────────────────');
console.log('Run these commands:');
console.log('  npm install -g pwa-asset-generator');
console.log('  pwa-asset-generator client/public/logo-icon.svg client/public/icons --background "#0B1A2B" --opaque false\n');

console.log('─────────────────────────────────────────────────────────────');
console.log('OPTION 3: Using Figma/Photoshop/Illustrator');
console.log('─────────────────────────────────────────────────────────────');
console.log('1. Open: client/public/logo-icon.svg');
console.log('2. Export PNG at these sizes:');
iconSizes.forEach(size => {
  console.log(`   - icon-${size}x${size}.png (${size}x${size}px)`);
});
console.log('\n3. Export favicons at these sizes:');
faviconSizes.forEach(size => {
  console.log(`   - favicon-${size}x${size}.png (${size}x${size}px)`);
});
console.log('   - favicon.ico (16x16, 32x32, 48x48 combined)\n');

console.log('─────────────────────────────────────────────────────────────');
console.log('REQUIRED FILES:');
console.log('─────────────────────────────────────────────────────────────');

// PWA Icons
console.log('\n📱 PWA Icons (client/public/):');
iconSizes.forEach(size => {
  console.log(`   [ ] icon-${size}x${size}.png`);
});

// Favicons
console.log('\n🔖 Favicons (client/public/):');
faviconSizes.forEach(size => {
  console.log(`   [ ] favicon-${size}x${size}.png`);
});
console.log('   [ ] favicon.ico');

// Social Preview
console.log('\n📸 Social Preview (client/public/):');
console.log('   [ ] social-preview.png (1200x630px)');
console.log('       Use logo + "True North Navigator" text');
console.log('       Background: Midnight Navy (#0B1A2B)');
console.log('       Logo: Aurora Teal (#2E8B8B)\n');

console.log('─────────────────────────────────────────────────────────────');
console.log('QUICK START:');
console.log('─────────────────────────────────────────────────────────────');
console.log('1. Install sharp package:');
console.log('   npm install sharp');
console.log('\n2. Run this script again:');
console.log('   node scripts/generateAssets.js\n');

// Check if sharp is available
try {
  require.resolve('sharp');
  console.log('✓ Sharp is installed! Running automatic generation...\n');
  generateWithSharp();
} catch (e) {
  console.log('⚠️  Sharp not installed. Use manual methods above.\n');
  console.log('To install sharp and auto-generate:');
  console.log('  npm install sharp && node scripts/generateAssets.js\n');
}

async function generateWithSharp() {
  try {
    const sharp = require('sharp');

    console.log('🔄 Generating icons...\n');

    // Create icons directory if it doesn't exist
    const iconsDir = path.join(__dirname, '../client/public');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    // Generate PWA icons
    for (const size of iconSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await sharp(logoPath)
        .resize(size, size, { fit: 'contain', background: { r: 11, g: 26, b: 43, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated: icon-${size}x${size}.png`);
    }

    // Generate favicons
    for (const size of faviconSizes) {
      const outputPath = path.join(iconsDir, `favicon-${size}x${size}.png`);
      await sharp(logoPath)
        .resize(size, size, { fit: 'contain', background: { r: 11, g: 26, b: 43, alpha: 0 } })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated: favicon-${size}x${size}.png`);
    }

    // Generate social preview (placeholder - needs custom design)
    const socialPath = path.join(iconsDir, 'social-preview.png');
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 11, g: 26, b: 43, alpha: 1 }
      }
    })
    .composite([
      {
        input: await sharp(logoPath)
          .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toFile(socialPath);

    console.log(`✓ Generated: social-preview.png (basic version)`);
    console.log('\n✅ All assets generated successfully!\n');
    console.log('📝 Note: Consider enhancing social-preview.png with text using');
    console.log('   a design tool like Figma or Canva.\n');

    // Update manifest.json icons
    updateManifest();

  } catch (error) {
    console.error('❌ Error generating assets:', error.message);
    console.log('\n💡 Try installing sharp:');
    console.log('   npm install sharp\n');
  }
}

function updateManifest() {
  try {
    const manifestPath = path.join(__dirname, '../client/public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Update icons array
    manifest.icons = iconSizes.map(size => ({
      src: `/icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: size >= 192 ? 'any maskable' : 'any'
    }));

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✓ Updated manifest.json with new icon paths\n');
  } catch (error) {
    console.error('⚠️  Could not update manifest.json:', error.message);
  }
}
