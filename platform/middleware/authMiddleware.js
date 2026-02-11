const { getUserById } = require("../models/userModel");

async function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  
  // Refresh user data from DB to ensure role/status is current
  const user = await getUserById(req.session.userId);
  if (!user) {
    req.session.destroy();
    return res.redirect("/login");
  }
  
  // console.log("Debug: app.requireAuth user:", user.username, "role:", user.role);
  req.user = user; // Attach user to request
  return next();
}

function requireAdmin(req, res, next) {
  // console.log("Debug: app.requireAdmin check:", req.user ? req.user.username : "no-user", req.user ? req.user.role : "no-role");
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).send("Access Denied: You do not have permission to view this page.");
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
