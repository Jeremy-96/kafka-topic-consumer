import { join, dirname } from 'path';
import { replaceInFileSync } from 'replace-in-file';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const replaceTsWithJs = async () => {
  try {
    await replaceInFileSync({
      files: join(__dirname, '../dist/**/*.js'),
      from: [/(import\s+(?:.+\s+from\s+)?)(['"])((\.(?:\/|\.\/))|(\/))([^'"]+?)(?<!\.js)\2/g],
      to: (match, p1, p2, p3, p4, p5, p6) => {
        return `${p1}${p2}${p3}${p6}.js${p2}`;
      },
    });
  } catch (error) {
    console.error('Error occurred during import replacement:', error);
  }
};

// Invoke the async function using an IIFE
(async () => {
  await replaceTsWithJs();
})();
