// scripts/generate-icons-manifest.js
const fs = require('fs');
const path = require('path');

// Adjust the path to where your icons are stored
const iconsDirPath = path.join(process.cwd(), 'public/assets/custom-icons');
const outputPath = path.join(process.cwd(), 'public/assets/icons-manifest.json');

try {
  console.log(`Reading icons from: ${iconsDirPath}`);
  const files = fs.readdirSync(iconsDirPath);
  const icons = files.filter(file => 
    file.endsWith('.png') || 
    file.endsWith('.jpg') || 
    file.endsWith('.svg')
  );
  
  fs.writeFileSync(outputPath, JSON.stringify(icons, null, 2));
  console.log(`Generated icons manifest with ${icons.length} icons at ${outputPath}`);
} catch (error) {
  console.error('Error generating icons manifest:', error);
  process.exit(1);
}