const { 
  getAllChallenges, 
  getChallengeById, 
  createChallenge, 
  updateChallenge, 
  deleteChallenge 
} = require("../models/challengeModel");
const { getSettings, setCurrentChallenge } = require("../models/settingsModel");

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

  const updates = {
    title,
    description,
    category,
    points: parseInt(points, 10),
    flag,
    link,
    status
  };

  await updateChallenge(id, updates);
  res.redirect("/admin?msg=Challenge%20updated");
}

async function deleteChallengeHandler(req, res) {
  const { id } = req.params;
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
  deleteChallengeHandler,
  updateCurrentChallengeHandler
};
