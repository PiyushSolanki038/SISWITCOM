const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'file-structure.txt');

function getTree(dir, prefix = '') {
  let output = '';
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  // Filter out node_modules and .git
  const filteredItems = items.filter(item => 
    !['node_modules', '.git', '.vscode', 'dist', 'build', 'coverage'].includes(item.name)
  );

  filteredItems.forEach((item, index) => {
    const isLast = index === filteredItems.length - 1;
    const marker = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';
    
    output += `${prefix}${marker}${item.name}\n`;
    
    if (item.isDirectory()) {
      output += getTree(path.join(dir, item.name), prefix + childPrefix);
    }
  });
  
  return output;
}

try {
  const tree = getTree(rootDir);
  fs.writeFileSync(outputFile, tree);
  console.log('File structure generated successfully.');
} catch (error) {
  console.error('Error generating file structure:', error);
}
