const path = require("path");
const { readJson } = require("./storage");

const challengesPath = path.join(__dirname, "..", "data", "challenges.json");

async function getAllChallenges() {
  return readJson(challengesPath);
}

async function getChallengeById(id) {
  const challenges = await getAllChallenges();
  return challenges.find((c) => c.id === id) || null;
}

async function createChallenge(challengeData) {
  const challenges = await getAllChallenges();
  const newChallenge = {
    id: "c" + Date.now(),
    ...challengeData,
    createdAt: new Date().toISOString()
  };
  challenges.push(newChallenge);
  await require("./storage").writeJson(challengesPath, challenges);
  return newChallenge;
}

async function updateChallenge(id, updates) {
  const challenges = await getAllChallenges();
  const index = challenges.findIndex((c) => c.id === id);
  if (index === -1) return null;
  
  challenges[index] = { ...challenges[index], ...updates, updatedAt: new Date().toISOString() };
  await require("./storage").writeJson(challengesPath, challenges);
  return challenges[index];
}

async function deleteChallenge(id) {
  let challenges = await getAllChallenges();
  const initialLength = challenges.length;
  challenges = challenges.filter(c => c.id !== id);
  if (challenges.length === initialLength) return false;
  
  await require("./storage").writeJson(challengesPath, challenges);
  return true;
}

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge
};
