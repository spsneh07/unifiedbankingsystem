const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = walk('d:/nexusbank/nexusbank/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add cache: 'no-store' to basic fetches
  const fetchRegex = /fetch\('(\/api\/[a-zA-Z-]+)'\)/g;
  if (fetchRegex.test(content)) {
    content = content.replace(fetchRegex, "fetch('$1', { cache: 'no-store' })");
    changed = true;
  }

  // Update useEffect dependencies
  const effectRegex = /useEffect\(\(\) => \{([\s\S]*?fetch[\s\S]*?)\}, \[\]\)/g;
  if (effectRegex.test(content) && !content.includes('const user =')) {
    content = content.replace(effectRegex, "const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;\n  useEffect(() => {$1}, [user?.id])");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
