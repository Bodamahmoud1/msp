const bcrypt = require("bcryptjs");
const { getUserByUsername, updateUser } = require("../models/userModel");

function showLogin(req, res) {
  const error = req.query.error || "";
  res.render("login", { error });
}

async function login(req, res) {
  const { username, password } = req.body;
  const user = await getUserByUsername(username || "");
  
  if (!user) {
    return res.redirect("/login?error=Invalid%20credentials");
  }

  // Check if password is hashed (bcrypt hashes start with $2a$ or $2b$)
  const isHashed = user.password.startsWith("$2a$") || user.password.startsWith("$2b$");

  let valid = false;
  if (isHashed) {
    valid = await bcrypt.compare(password, user.password);
  } else {
    // Legacy plain text check
    if (user.password === password) {
      valid = true;
      // Lazy migration: hash and update
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await updateUser(user); 
    }
  }

  if (!valid) {
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
