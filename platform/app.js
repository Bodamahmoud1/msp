require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// DEBUG: Request Logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

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

// Admin Routes
console.log("Debug: Registering Admin Routes...");
console.log("Debug: adminController.showDashboard is:", typeof adminController.showDashboard);

app.get("/admin-debug", (req, res) => {
  res.send("Admin Debug Route Works! Server is updated.");
});

app.get("/admin", requireAuth, requireAdmin, adminController.showDashboard);
app.get("/admin/challenges/new", requireAuth, requireAdmin, adminController.showNewChallenge);
app.post("/admin/challenges/new", requireAuth, requireAdmin, adminController.createChallengeHandler);
app.get("/admin/challenges/:id/edit", requireAuth, requireAdmin, adminController.showEditChallenge);
app.post("/admin/challenges/:id/edit", requireAuth, requireAdmin, adminController.updateChallengeHandler);
app.post("/admin/challenges/:id/delete", requireAuth, requireAdmin, adminController.deleteChallengeHandler);

app.get("/scoreboard", scoreboardController.showScoreboard);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`CTF app running on http://localhost:${port}`);
  
  console.log("--- Registered Routes ---");
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      console.log(r.route.path)
    }
  })
  console.log("-------------------------");
});
