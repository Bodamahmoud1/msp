const { getUserByUsername, updateUser } = require("../models/userModel");

function showLogin(req, res) {
  const error = req.query.error || "";
  res.render("login", { error });
}

function showAccount(req, res) {
  const message = req.query.message || "";
  const error = req.query.error || "";
  res.render("account", { user: req.user, message, error });
}

async function login(req, res) {
  const { username, password } = req.body;
  const user = await getUserByUsername(username || "");
  
  if (!user) {
    return res.redirect("/login?error=Invalid%20credentials");
  }

  const valid = user.password === password;

  if (!valid) {
    return res.redirect("/login?error=Invalid%20credentials");
  }

  req.session.userId = user.id;
  return res.redirect("/challenges");
}

async function updateAccount(req, res) {
  const { displayName, currentPassword, newPassword, confirmPassword } = req.body;
  const user = req.user;
  const trimmedDisplayName = (displayName || "").trim();

  if (user.password !== currentPassword) {
    return res.redirect("/account?error=Current%20password%20is%20incorrect");
  }

  let changed = false;
  const updatedUser = { ...user };

  if (trimmedDisplayName !== (user.displayName || "")) {
    updatedUser.displayName = trimmedDisplayName;
    changed = true;
  }

  if (newPassword || confirmPassword) {
    if (!newPassword || newPassword !== confirmPassword) {
      return res.redirect("/account?error=New%20passwords%20do%20not%20match");
    }
    updatedUser.password = newPassword;
    changed = true;
  }

  if (!changed) {
    return res.redirect("/account?error=No%20changes%20submitted");
  }

  const saved = await updateUser(updatedUser);
  if (!saved) {
    return res.redirect("/account?error=Unable%20to%20save%20changes");
  }

  return res.redirect("/account?message=Account%20updated");
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}

module.exports = { showLogin, showAccount, login, updateAccount, logout };
