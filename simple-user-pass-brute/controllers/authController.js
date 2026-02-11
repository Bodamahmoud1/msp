const { findUser } = require("../models/userModel");

function login(req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  const user = findUser(username);
  if (!user) {
    return res.status(404).json({ ok: false, message: "wrong credentials" });
  }

  if (password !== user.password) {
    return res.status(401).json({ ok: false, message: "wrong credentials" });
  }

  return res.json({ ok: true, message: "access granted", flag: `Login successful: ${user.flag}` });
}

module.exports = { login };
