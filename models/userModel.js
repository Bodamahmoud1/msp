const path = require("path");
const { readJson, writeJson } = require("./storage");

const usersPath = path.join(__dirname, "..", "data", "users.json");

async function getAllUsers() {
  return readJson(usersPath);
}

async function getUserByUsername(username) {
  const users = await getAllUsers();
  return users.find((u) => u.username === username) || null;
}

async function getUserById(id) {
  const users = await getAllUsers();
  return users.find((u) => u.id === id) || null;
}

async function updateUser(updatedUser) {
  const users = await getAllUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index === -1) return false;
  users[index] = updatedUser;
  await writeJson(usersPath, users);
  return true;
}

module.exports = {
  getAllUsers,
  getUserByUsername,
  getUserById,
  updateUser
};
