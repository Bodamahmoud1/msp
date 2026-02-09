const express = require("express");
const session = require("express-session");
const path = require("path");

const authController = require("./controllers/authController");
const challengeController = require("./controllers/challengeController");
const scoreboardController = require("./controllers/scoreboardController");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "mushroom-loves-you-dont-change-this",
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.static(path.join(__dirname, "public")));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  return next();
}

app.get("/", (req, res) => {
  if (req.session.userId) return res.redirect("/challenges");
  return res.redirect("/login");
});

app.get("/login", authController.showLogin);
app.post("/login", authController.login);
app.get("/logout", authController.logout);

app.get("/challenges", requireAuth, challengeController.listChallenges);
app.post("/submit-flag", requireAuth, challengeController.submitFlag);

app.get("/scoreboard", requireAuth, scoreboardController.showScoreboard);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`CTF app running on http://localhost:${port}`);
});
