const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fileDir = path.join(dir, file);
    const stat = fs.statSync(fileDir);
    if (stat && stat.isDirectory()) {
      if (file !== 'lib') {
        results = results.concat(walkDir(fileDir));
      }
    } else {
      if (file.endsWith('.js') && file !== 'seed.js') {
        results.push(fileDir);
      }
    }
  });
  return results;
}

const files = walkDir('api');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('export default async function handler(req, res) {') && !content.includes('req.method === "OPTIONS"')) {
    content = content.replace(
      'export default async function handler(req, res) {',
      'export default async function handler(req, res) {\n  if (req.method === "OPTIONS") return res.status(200).end();'
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added OPTIONS handler to ' + file);
  }
});

console.log('Done!');
