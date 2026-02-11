require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");


const authController = require("./controllers/authController");
const challengeController = require("./controllers/challengeController");
const scoreboardController = require("./controllers/scoreboardController");
const adminController = require("./controllers/adminController");
const { requireAuth, requireAdmin } = require("./middleware/authMiddleware");

const app = express();
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Global rate limiting
// Global rate limiting removed
// const limiter = rateLimit({ ... });
// app.use(limiter);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "mushroom-loves-you-dont-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
    httpOnly: true,
    secure: false
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "public")));

// Removed local requireAuth definition in favor of middleware import

app.get("/", (req, res) => {
  if (req.session.userId) return res.redirect("/challenges");
  return res.redirect("/login");
});

// const loginLimiter = rateLimit({ ... });

app.get("/login", authController.showLogin);
app.post("/login", authController.login);
app.get("/logout", authController.logout);
app.get("/account", requireAuth, authController.showAccount);
app.post("/account", requireAuth, authController.updateAccount);

app.get("/challenges", requireAuth, challengeController.listChallenges);
// const submitLimiter = rateLimit({ ... });
app.post("/submit-flag", requireAuth, challengeController.submitFlag);

// Admin Routes

app.get("/admin-debug", (req, res) => {
  res.send("Admin Debug Route Works! Server is updated.");
});

app.get("/admin", requireAuth, requireAdmin, adminController.showDashboard);
app.get("/admin/challenges/new", requireAuth, requireAdmin, adminController.showNewChallenge);
app.post("/admin/challenges/new", requireAuth, requireAdmin, adminController.upload.single('file'), adminController.createChallengeHandler);
app.get("/admin/challenges/:id/edit", requireAuth, requireAdmin, adminController.showEditChallenge);
app.post("/admin/challenges/:id/edit", requireAuth, requireAdmin, adminController.upload.single('file'), adminController.updateChallengeHandler);
app.post("/admin/challenges/:id/delete", requireAuth, requireAdmin, adminController.deleteChallengeHandler);
app.post("/admin/current-challenge", requireAuth, requireAdmin, adminController.updateCurrentChallengeHandler);

app.get("/scoreboard", scoreboardController.showScoreboard);
app.get("/api/scoreboard", scoreboardController.getScoreboardData);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
