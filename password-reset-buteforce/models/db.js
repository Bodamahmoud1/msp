const users = [];
let nextId = 1;

function seedAdmin() {
  const adminPassword = `admin_${Math.random().toString(36).slice(2, 10)}`;
  users.push({
    id: nextId++,
    username: "admin",
    password: adminPassword,
    resetCode: null,
    isAdmin: true,
    flag: "MSP{r3s3t_c0d3_brut3f0rc3_w1n}"
  });
  return adminPassword;
}

function findUserByUsername(username) {
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

function createUser(username, password) {
  const user = { id: nextId++, username, password, resetCode: null, isAdmin: false, flag: null };
  users.push(user);
  return user;
}

function setResetCode(user, code) {
  user.resetCode = code;
}

function updatePassword(user, newPassword) {
  user.password = newPassword;
  user.resetCode = null;
}

function authenticate(username, password) {
  const user = findUserByUsername(username);
  if (!user) return null;
  return user.password === password ? user : null;
}

module.exports = {
  users,
  seedAdmin,
  findUserByUsername,
  createUser,
  setResetCode,
  updatePassword,
  authenticate
};
