const db = require("../models/db");

function getRegister(req, res) {
  res.render("register", { error: null });
}

function postRegister(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render("register", { error: "Username and password required." });
  }
  if (db.findUserByUsername(username)) {
    return res.render("register", { error: "Username already registered." });
  }
  db.createUser(username.trim(), password);
  res.redirect("/login");
}

function getLogin(req, res) {
  res.render("login", { error: null });
}

function postLogin(req, res) {
  const { username, password } = req.body;
  const normalizedUsername = (username || "").trim();
  const existingUser = db.findUserByUsername(normalizedUsername);
  if (!existingUser) {
    return res.render("login", { error: "Username not found." });
  }
  const user = db.authenticate(normalizedUsername, password || "");
  if (!user) {
    return res.render("login", { error: "Invalid password." });
  }
  req.session.userId = user.id;
  res.redirect("/profile");
}

function postLogout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  postLogout
};
