const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file === 'route.ts') {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = walk('d:/nexusbank/nexusbank/app/api');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('export const dynamic = \'force-dynamic\';')) {
    content = 'export const dynamic = \'force-dynamic\';\n' + content;
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added force-dynamic to ' + file);
  }
});
