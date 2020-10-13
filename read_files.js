const fs = require('fs').promises;
const path = require('path');
const minimatch = require('minimatch');

async function walkNode(root, relative, { all, include, exclude, map }) {
  const file = path.join(root, relative);
  const stat = await fs.lstat(file);
  const match = pattern => minimatch(relative, pattern);
  if (stat.isSymbolicLink() || exclude.some(match)) {
    return [];
  }
  all |= include.some(match);
  return stat.isDirectory()
      ? walk(root, relative, { all, include, exclude, map })
      : (all ? [relative] : []);
}

async function walk (root, dir, { all, include, exclude, map = {} }) {
  const names = await fs.readdir(path.join(root, dir));
  const results = await Promise.all(names
    .map(name => path.join(dir, name))
    .filter(name => !map[name])
    .map(relative => walkNode(root, relative, { all, include, exclude, map }))
  );
  return results.flat();
}

module.exports = function (root, { include, exclude = [], map = {} }) {
  return walk(root, '', { all: false, include, exclude, map });
};
