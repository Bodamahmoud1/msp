const users = [];
let nextId = 1;

function seedAdmin() {
  const adminPassword = `admin_${Math.random().toString(36).slice(2, 10)}`;
  users.push({
    id: nextId++,
    email: "admin@mushroom.cat",
    password: adminPassword,
    resetCode: null,
    isAdmin: true,
    flag: "MSP{r3s3t_c0d3_brut3f0rc3_w1n}"
  });
  return adminPassword;
}

function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function createUser(email, password) {
  const user = { id: nextId++, email, password, resetCode: null, isAdmin: false, flag: null };
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

function authenticate(email, password) {
  const user = findUserByEmail(email);
  if (!user) return null;
  return user.password === password ? user : null;
}

module.exports = {
  users,
  seedAdmin,
  findUserByEmail,
  createUser,
  setResetCode,
  updatePassword,
  authenticate
};
