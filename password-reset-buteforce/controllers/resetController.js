const db = require("../models/db");

function getRequest(req, res) {
  res.render("reset_request", { message: null });
}

function postRequest(req, res) {
  const { email } = req.body;
  if (email) {
    const user = db.findUserByEmail(email.trim());
    if (user) {
      const code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
      db.setResetCode(user, code);
    }
  }
  res.render("reset_request", {
    message: "If the account exists, a 4-digit code was sent."
  });
}

function getConfirm(req, res) {
  res.render("reset_confirm", { error: null, message: null });
}

function postConfirm(req, res) {
  const { email, code, newPassword } = req.body;
  const user = db.findUserByEmail((email || "").trim());
  if (!user || !code || !newPassword) {
    return res.render("reset_confirm", { error: "Invalid data.", message: null });
  }
  if (user.resetCode !== code) {
    return res.render("reset_confirm", { error: "Wrong code. Try again.", message: null });
  }
  db.updatePassword(user, newPassword);
  res.render("reset_confirm", { error: null, message: "Password updated. You can now log in." });
}

module.exports = {
  getRequest,
  postRequest,
  getConfirm,
  postConfirm
};
