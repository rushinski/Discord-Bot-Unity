/**
 * Utility: ReadFolder
 * ----------------------------------------
 * Recursively reads a folder and returns an array of discovered .js modules.
 *
 * Returns:
 * [
 *   {
 *     path: string,   // relative path to the file
 *     depth: number,  // recursion depth remaining
 *     data: any       // required module export
 *   }
 * ]
 *
 * Notes:
 * - Skips non-JS files.
 * - Respects a max recursion depth (default: 3).
 * - Logs failures but continues execution.
 */

const fs = require('node:fs');
const path = require('node:path');

function ReadFolder(target = '', depth = 3) {
  const results = [];
  const basePath = path.join(__dirname, '..', target);

  let folderFiles;
  try {
    folderFiles = fs.readdirSync(basePath, { withFileTypes: true });
  } catch (err) {
    console.error(`[ReadFolder] ❌ Failed to read directory: ${basePath}`, err.message);
    return results;
  }

  for (const file of folderFiles) {
    const filePath = path.join(target, file.name);

    if (file.isDirectory()) {
      if (depth <= 0) {
        console.warn(`[ReadFolder] ⚠️ Maximum depth reached — skipping ${filePath}`);
        continue;
      }
      results.push(...ReadFolder(filePath, depth - 1));
      continue;
    }

    if (!file.name.endsWith('.js')) continue;

    try {
      const data = require(path.join(__dirname, '..', filePath));
      results.push({ path: filePath, depth, data });
      console.log(`[ReadFolder] ✅ Loaded file: ./${filePath}`);
    } catch (err) {
      console.error(`[ReadFolder] ❌ Failed to require ./${filePath}:`, err.message);
    }
  }

  return results;
}

module.exports = ReadFolder;
