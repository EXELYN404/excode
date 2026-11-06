import { generateManifest } from 'material-icon-theme';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const iconsSource = path.join(root, 'node_modules/material-icon-theme/icons');
const iconsDest = path.join(root, 'public/excode-material-icons');
const manifest = generateManifest();

fs.mkdirSync(iconsDest, { recursive: true });

const iconDefinitions = {};

for (const [name, definition] of Object.entries(manifest.iconDefinitions)) {
  const filename = path.basename(definition.iconPath);
  const source = path.join(iconsSource, filename);
  const destination = path.join(iconsDest, filename);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing Material Icon SVG: ${source}`);
  }

  if (!fs.existsSync(destination)) {
    fs.copyFileSync(source, destination);
  }

  iconDefinitions[name] = filename;
}

const output = {
  file: manifest.file,
  folder: manifest.folder,
  folderExpanded: manifest.folderExpanded,
  rootFolder: manifest.rootFolder,
  rootFolderExpanded: manifest.rootFolderExpanded,
  fileExtensions: manifest.fileExtensions,
  fileNames: manifest.fileNames,
  folderNames: manifest.folderNames,
  folderNamesExpanded: manifest.folderNamesExpanded,
  rootFolderNames: manifest.rootFolderNames,
  rootFolderNamesExpanded: manifest.rootFolderNamesExpanded,
  iconDefinitions,
};

fs.writeFileSync(
  path.join(root, 'src/generated/materialIconManifest.ts'),
  `// Generated from material-icon-theme. Do not edit manually.\nexport default ${JSON.stringify(output, null, 2)} as const;\n`,
);

console.log(`Material Icon Theme: ${Object.keys(iconDefinitions).length} SVG icons synchronized.`);
