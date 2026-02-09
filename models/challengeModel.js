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

module.exports = {
  getAllChallenges,
  getChallengeById
};
