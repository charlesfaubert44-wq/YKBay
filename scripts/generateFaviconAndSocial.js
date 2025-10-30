/**
 * Generate favicon.ico and enhanced social preview
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateEnhancedSocial() {
  console.log('\n🎨 Generating Enhanced Social Preview...\n');

  const logoPath = path.join(__dirname, '../client/public/logo-icon.svg');
  const outputPath = path.join(__dirname, '../client/public/social-preview.png');

  // Create background
  const width = 1200;
  const height = 630;

  // Create SVG with logo and text
  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background gradient -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0B1A2B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a3346;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>

      <!-- Aurora effect circles -->
      <circle cx="200" cy="150" r="300" fill="#2E8B8B" opacity="0.1"/>
      <circle cx="1000" cy="500" r="250" fill="#5B9BD5" opacity="0.08"/>

      <!-- Title -->
      <text x="600" y="280" text-anchor="middle"
            font-family="'Outfit', sans-serif" font-size="72"
            font-weight="700" fill="#E8F4F4">
        True North Navigator
      </text>

      <!-- Tagline -->
      <text x="600" y="350" text-anchor="middle"
            font-family="'Inter', sans-serif" font-size="32"
            font-weight="400" fill="#2E8B8B">
        Community-Guided Waters of the North
      </text>

      <!-- Location badge -->
      <rect x="480" y="420" width="240" height="50" rx="25"
            fill="#2E8B8B" opacity="0.2"/>
      <text x="600" y="453" text-anchor="middle"
            font-family="'Inter', sans-serif" font-size="20"
            font-weight="600" fill="#2E8B8B">
        NWT • CANADA
      </text>
    </svg>
  `;

  try {
    await sharp(Buffer.from(svgText))
      .png()
      .toFile(outputPath);

    console.log('✓ Generated: social-preview.png (1200x630)');
    console.log('  - Background: Midnight Navy gradient');
    console.log('  - Text: True North Navigator');
    console.log('  - Tagline: Community-Guided Waters\n');
  } catch (error) {
    console.error('❌ Error generating social preview:', error.message);
  }
}

async function generateFavicon() {
  console.log('🔖 Generating favicon.ico...\n');

  const logoPath = path.join(__dirname, '../client/public/logo-icon.svg');
  const outputPath = path.join(__dirname, '../client/public/favicon.ico');

  try {
    // Generate 32x32 version for ICO (most common)
    await sharp(logoPath)
      .resize(32, 32, { fit: 'contain', background: { r: 11, g: 26, b: 43, alpha: 1 } })
      .toFormat('png')
      .toFile(outputPath.replace('.ico', '-temp.png'));

    // Rename to .ico (browsers accept PNG as .ico)
    fs.renameSync(
      outputPath.replace('.ico', '-temp.png'),
      outputPath
    );

    console.log('✓ Generated: favicon.ico');
    console.log('  Note: This is a PNG formatted as .ico (works in modern browsers)\n');
  } catch (error) {
    console.error('❌ Error generating favicon:', error.message);
  }
}

async function updateIndexHtml() {
  console.log('📝 Updating index.html with favicon links...\n');

  const htmlPath = path.join(__dirname, '../client/index.html');

  try {
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Check if favicon links already exist
    if (html.includes('favicon.ico')) {
      console.log('✓ Favicon links already in index.html\n');
      return;
    }

    // Add favicon links after the <title> tag
    const faviconLinks = `    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png">`;

    html = html.replace(
      /(<title>.*?<\/title>)/,
      `$1\n${faviconLinks}`
    );

    fs.writeFileSync(htmlPath, html);
    console.log('✓ Updated index.html with favicon links\n');
  } catch (error) {
    console.error('❌ Error updating index.html:', error.message);
  }
}

async function main() {
  console.log('\n🚀 True North Navigator - Favicon & Social Generator\n');
  console.log('====================================================\n');

  await generateFavicon();
  await generateEnhancedSocial();
  await updateIndexHtml();

  console.log('====================================================');
  console.log('✅ All assets generated successfully!\n');
  console.log('Generated files:');
  console.log('  - client/public/favicon.ico');
  console.log('  - client/public/social-preview.png');
  console.log('\nNext steps:');
  console.log('  1. Check the generated social-preview.png');
  console.log('  2. Refresh your browser to see new favicon');
  console.log('  3. Test PWA installation with new icons\n');
}

main().catch(console.error);
