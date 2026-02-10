const fs = require("fs").promises;

const cache = new Map();

async function readJson(path) {
  if (cache.has(path)) {
    return cache.get(path);
  }
  try {
    const raw = await fs.readFile(path, "utf8");
    const data = JSON.parse(raw);
    cache.set(path, data);
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeJson(path, data) {
  const pretty = JSON.stringify(data, null, 2);
  await fs.writeFile(path, pretty, "utf8");
  cache.set(path, data); // Update cache
}

module.exports = { readJson, writeJson };
