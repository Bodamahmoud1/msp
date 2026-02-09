const { getUserByUsername } = require("../models/userModel");

function showLogin(req, res) {
  const error = req.query.error || "";
  res.render("login", { error });
}

async function login(req, res) {
  const { username, password } = req.body;
  const user = await getUserByUsername(username || "");
  if (!user || user.password !== password) {
    return res.redirect("/login?error=Invalid%20credentials");
  }
  req.session.userId = user.id;
  return res.redirect("/challenges");
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}

module.exports = { showLogin, login, logout };
