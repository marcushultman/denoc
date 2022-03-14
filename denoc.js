#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const IMPORT_RE = /(?<=^|\n)((?:im|ex)port\s[\w\s{}*,\n]*['"])(.*)(['"];\n)/g;

const [,, root = process.cwd()] = process.argv;

function getConfig() {
  const config = require(path.join(root, 'package.json')).denoc;
  if (!config) {
    throw new Error(`No 'denoc' config found`);
  }
  return config;
}

function mapDependency(dep, prefix, suffix, onImport, parentFile) {
  if (!dep) {
    return '';
  }
  if (typeof dep === 'string') {
    if (dep.startsWith('.')) {
      onImport(false, path.normalize(dep));
      return `${prefix}./${path.relative(path.dirname(parentFile), dep)}${suffix}`;
    }
    return `${prefix}${dep}${suffix}`;
  }
  if (!dep[parentFile] || typeof dep[parentFile] !== 'string') {
    throw new Error(`Missing '${parentFile}' in '${dep}'`);
  }
  return mapDependency(dep[parentFile], prefix, suffix, onImport);
}

function resolveImport(parentFile, id) {
  return id.startsWith('.') ? path.join(path.dirname(parentFile), `${id}.ts`) : null;
}

function mapImport(parentFile, prefix, id, suffix, dependencies, onImport) {
  const file = resolveImport(parentFile, id);
  if (file) {
    if (file in dependencies) {
      return mapDependency(dependencies[file], prefix, suffix, onImport, parentFile)
    }
    onImport(true, file);
    return `${prefix}${id}.ts${suffix}`;
  } else if (id in dependencies) {
    return mapDependency(dependencies[id], prefix, suffix, onImport, parentFile);
  }
  throw new Error(`Unhandled dependency '${id}' in '${parentFile}'.`);
}

function extractImports(parentFile, matches, onImport) {
  for (const [_1, _2, id] of matches) {
    const file = resolveImport(parentFile, id);
    if (file) {
      onImport(false, file);
    }
  }
}

async function denocFile(translate, srcRoot, file, outDir, dependencies) {
  const imports = [];
  const onImport = (translate, file) => imports.push({ translate, file });
  const srcFile = path.join(root, file);
  const dstFile = path.join(root, outDir, path.relative(srcRoot, file));
  await fs.mkdir(path.dirname(dstFile), { recursive: true });
  const src = await fs.readFile(srcFile, 'utf-8');
  if (translate) {
    const dst = src.replace(IMPORT_RE, (_, prefix, id, suffix) =>
      mapImport(file, prefix, id, suffix, dependencies, onImport)
    );
    await fs.writeFile(dstFile, dst);
  } else {
    extractImports(file, src.matchAll(IMPORT_RE), onImport);
    await fs.copyFile(srcFile, dstFile);
  }
  for (const { translate, file } of imports) {
    await denocFile(translate, srcRoot, file, outDir, dependencies);
  }
}

function makeRelativeRoot(p, def) {
  return p ? (path.isAbsolute(p) ? path.relative(root, p) : p) : def;
}

async function copyFiles(copy, outDir) {
  await Promise.all(copy.map(file => makeRelativeRoot(file)).map(async file => {
    const srcFile = path.join(root, file);
    const dstFile = path.join(root, outDir, path.relative(root, file));
    await fs.mkdir(path.dirname(dstFile), { recursive: true });
    await fs.copyFile(srcFile, dstFile);
  }));
}

async function renderFiles(main, outDir, dependencies, copy) {
  const srcRoot = path.dirname(main);
  await Promise.all([
    denocFile(true, srcRoot, main, outDir, dependencies),
    copyFiles(copy, outDir),
  ]);
}

async function main() {
  const config = getConfig();

  if (!config.main) {
    console.error(`'main' not specified array.`);
    process.exit(1);
  }
  const main = makeRelativeRoot(config.main);
  const outDir = makeRelativeRoot(config.outDir, '.');
  const dependencies = config.dependencies ?? {};
  const copy = config.copy ?? [];
  await renderFiles(main, outDir, dependencies, copy);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
