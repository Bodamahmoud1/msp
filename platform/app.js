require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authController = require("./controllers/authController");
const challengeController = require("./controllers/challengeController");
const scoreboardController = require("./controllers/scoreboardController");

const app = express();

// Security headers
app.use(helmet());

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mushroom-loves-you-dont-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // reliable only if behind proxy handling https
    }
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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Relaxed for local dev
  message: "Too many login attempts, please try again later"
});

app.get("/login", authController.showLogin);
app.post("/login", loginLimiter, authController.login);
app.get("/logout", authController.logout);

app.get("/challenges", requireAuth, challengeController.listChallenges);
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20, // limit to 20 submissions per hour
  message: "Too many submissions, please slow down"
});
app.post("/submit-flag", requireAuth, submitLimiter, challengeController.submitFlag);

app.get("/scoreboard", scoreboardController.showScoreboard);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`CTF app running on http://localhost:${port}`);
});
