const db = require("../models/db");

function getRegister(req, res) {
  res.render("register", { error: null });
}

function postRegister(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("register", { error: "Email and password required." });
  }
  if (db.findUserByEmail(email)) {
    return res.render("register", { error: "Email already registered." });
  }
  db.createUser(email.trim(), password);
  res.redirect("/login");
}

function getLogin(req, res) {
  res.render("login", { error: null });
}

function postLogin(req, res) {
  const { email, password } = req.body;
  const user = db.authenticate(email || "", password || "");
  if (!user) {
    return res.render("login", { error: "Invalid credentials." });
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
