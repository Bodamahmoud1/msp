const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { 
  getAllChallenges, 
  getChallengeById, 
  createChallenge, 
  updateChallenge, 
  deleteChallenge 
} = require("../models/challengeModel");
const { getSettings, setCurrentChallenge } = require("../models/settingsModel");

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/uploads/challenges");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename: remove special chars, keep extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    cb(null, basename + '-' + uniqueSuffix + ext);
  }
});

// File Filter for Security
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|zip|rar|7z|tar|gz/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype === 'application/x-zip-compressed' || 
                   file.mimetype === 'application/zip' || 
                   file.mimetype === 'application/x-rar-compressed' ||
                   file.mimetype === 'application/octet-stream'; // weak check but needed for some generic binary types

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File type not allowed! (Images, PDF, TXT, Archives only)'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

async function showDashboard(req, res) {
  const challenges = await getAllChallenges();
  const settings = await getSettings();
  const message = req.query.msg || "";
  const error = req.query.error || "";
  
  res.render("admin/dashboard", {
    user: req.user,
    challenges,
    currentChallengeId: settings.currentChallengeId || "",
    message,
    error
  });
}

function showNewChallenge(req, res) {
  res.render("admin/new-challenge", {
    user: req.user,
    error: ""
  });
}

async function createChallengeHandler(req, res) {
  const { title, description, category, points, flag, link, status } = req.body;
  const file = req.file;
  
  if (!title || !flag || !points) {
    return res.render("admin/new-challenge", {
      user: req.user,
      error: "Title, Flag, and Points are required."
    });
  }

  const newChallenge = {
    title,
    description,
    category: category || "Misc",
    points: parseInt(points, 10),
    flag,
    link: link || "",
    file: file ? `/uploads/challenges/${file.filename}` : null,
    status: status || "draft",
    author: req.user.username
  };

  await createChallenge(newChallenge);
  res.redirect("/admin?msg=Challenge%20created");
}

async function showEditChallenge(req, res) {
  const challenge = await getChallengeById(req.params.id);
  if (!challenge) return res.redirect("/admin?error=Challenge%20not%20found");

  res.render("admin/edit-challenge", {
    user: req.user,
    challenge,
    error: ""
  });
}

async function updateChallengeHandler(req, res) {
  const { id } = req.params;
  const { title, description, category, points, flag, link, status } = req.body;
  const file = req.file;

  const updates = {
    title,
    description,
    category,
    points: parseInt(points, 10),
    flag,
    link,
    status
  };

  if (file) {
    updates.file = `/uploads/challenges/${file.filename}`;
  }

  await updateChallenge(id, updates);
  res.redirect("/admin?msg=Challenge%20updated");
}

async function deleteChallengeHandler(req, res) {
  const { id } = req.params;
  const challenge = await getChallengeById(id);
  
  if (challenge && challenge.file) {
    const filePath = path.join(__dirname, "../public", challenge.file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    }
  }

  await deleteChallenge(id);
  res.redirect("/admin?msg=Challenge%20deleted");
}

async function updateCurrentChallengeHandler(req, res) {
  const { currentChallengeId } = req.body;
  const challenges = await getAllChallenges();
  const exists = challenges.some((c) => c.id === currentChallengeId);
  if (!exists) {
    return res.redirect("/admin?error=Invalid%20current%20challenge");
  }
  await setCurrentChallenge(currentChallengeId);
  return res.redirect("/admin?msg=Current%20challenge%20updated");
}

module.exports = {
  showDashboard,
  showNewChallenge,
  createChallengeHandler,
  showEditChallenge,
  updateChallengeHandler,
  upload, // Export upload middleware
  updateCurrentChallengeHandler
};
