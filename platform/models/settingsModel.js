const path = require("path");
const { readJson, writeJson } = require("./storage");

const settingsPath = path.join(__dirname, "..", "data", "settings.json");

const defaultSettings = {
  currentChallengeId: ""
};

async function getSettings() {
  const data = await readJson(settingsPath);
  if (!data || Array.isArray(data)) return { ...defaultSettings };
  return { ...defaultSettings, ...data };
}

async function setCurrentChallenge(currentChallengeId) {
  const settings = await getSettings();
  settings.currentChallengeId = currentChallengeId || "";
  await writeJson(settingsPath, settings);
  return settings;
}

module.exports = {
  getSettings,
  setCurrentChallenge
};
