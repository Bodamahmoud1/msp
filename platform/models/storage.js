const fs = require("fs").promises;

async function readJson(path) {
  const raw = await fs.readFile(path, "utf8");
  return JSON.parse(raw);
}

async function writeJson(path, data) {
  const pretty = JSON.stringify(data, null, 2);
  await fs.writeFile(path, pretty, "utf8");
}

module.exports = { readJson, writeJson };
