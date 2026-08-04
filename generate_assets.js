const fs = require('fs');
const path = require('path');

// Valid 16x16 PNG file buffer
const validPngBuffer = Buffer.from(
  '89504e470d0a1a0a0000000d4948445200000010000000100802000000909168360000001549444154789c63f8cfc0c0c000000300010000ffff0000000049454e44ae426082',
  'hex'
);

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'].forEach(file => {
  fs.writeFileSync(path.join(assetsDir, file), validPngBuffer);
  console.log('Regenerated valid PNG asset:', file);
});
