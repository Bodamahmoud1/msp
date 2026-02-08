const path = require("path");
const express = require("express");
const session = require("express-session");

const db = require("./models/db");
const auth = require("./controllers/authController");
const reset = require("./controllers/resetController");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "ctf-reset-secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(express.static(path.join(__dirname, "public")));

const adminPassword = db.seedAdmin();

function currentUser(req) {
  if (!req.session.userId) return null;
  return db.users.find((u) => u.id === req.session.userId) || null;
}

function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.redirect("/login");
  req.user = user;
  next();
}

app.get("/", (req, res) => {
  res.render("index", { user: currentUser(req) });
});

app.get("/register", auth.getRegister);
app.post("/register", auth.postRegister);
app.get("/login", auth.getLogin);
app.post("/login", auth.postLogin);
app.post("/logout", auth.postLogout);

app.get("/reset", reset.getRequest);
app.post("/reset/request", reset.postRequest);
app.get("/reset/confirm", reset.getConfirm);
app.post("/reset/confirm", reset.postConfirm);

app.get("/profile", requireAuth, (req, res) => {
  res.render("profile", { user: req.user });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Challenge running on http://localhost:${port}`);
  console.log(`Admin password (unknown to players): ${adminPassword}`);
});
