import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

function checkImports() {
  const files = getAllFiles(SRC_DIR).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  let errors = 0;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('.')) {
        const fullPath = path.resolve(path.dirname(file), importPath);
        const extensions = ['.ts', '.tsx', '.d.ts', '/index.ts', '/index.tsx'];
        let found = fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory();

        if (!found) {
          for (const ext of extensions) {
            if (fs.existsSync(fullPath + ext)) {
              found = true;
              break;
            }
          }
        }

        if (!found) {
          console.error(`❌ Broken import in ${path.relative(__dirname, file)}: ${importPath}`);
          errors++;
        }
      }
    }
  });

  if (errors === 0) {
    console.log('✅ All local imports are valid.');
  } else {
    console.log(`\nFound ${errors} broken imports.`);
  }
  return errors === 0;
}

console.log('--- Project Integrity Judge ---');
const importsOk = checkImports();

if (importsOk) {
    process.exit(0);
} else {
    process.exit(1);
}
