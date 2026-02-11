const USER = {
  username: "guest",
  password: "abc123",
  flag: "MSP{m5p_brut3_f0rc3d}"
};

function findUser(username) {
  if (username !== USER.username) return null;
  return USER;
}

module.exports = { findUser };
