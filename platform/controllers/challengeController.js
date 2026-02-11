const { getUserById, updateUser } = require("../models/userModel");
const { getAllChallenges, getChallengeById } = require("../models/challengeModel");
const { getSettings } = require("../models/settingsModel");

async function listChallenges(req, res) {
  const user = await getUserById(req.session.userId);
  if (!user) return res.redirect("/login");
  
  // Refresh user to get role if needed, though req.user might be available if using middleware globally
  // using getUserById ensures we have fresh data
  
  // console.log("Debug: challengeController.listChallenges user:", user.username, "role:", user.role);

  const [challenges, settings] = await Promise.all([
    getAllChallenges(),
    getSettings()
  ]);
  const availableChallenges = challenges.filter(c => c.status === 'active');
  const endedChallenges = challenges.filter(c => c.status === 'ended');
  const currentChallenge = challenges.find(c => c.id === settings.currentChallengeId) || null;

  const solvedSet = new Set(user.solved || []);
  const message = req.query.msg || "";
  const error = req.query.error || "";

  res.render("challenges", {
    user,
    availableChallenges,
    endedChallenges,
    currentChallenge,
    solvedSet,
    message,
    error
  });
}

async function submitFlag(req, res) {
  const user = await getUserById(req.session.userId);
  if (!user) return res.redirect("/login");

  const { challengeId, flag } = req.body;
  const challenge = await getChallengeById(challengeId);
  if (!challenge) {
    return res.redirect("/challenges?error=Unknown%20challenge");
  }

  if (challenge.status !== 'active') {
    return res.redirect("/challenges?error=This%20challenge%20is%20not%20active%20and%20cannot%20be%20submitted");
  }

  const alreadySolved = (user.solved || []).includes(challenge.id);
  if (alreadySolved) {
    return res.redirect("/challenges?msg=Already%20solved");
  }

  if ((flag || "").trim() !== challenge.flag) {
    return res.redirect("/challenges?error=Wrong%20flag");
  }

  const updated = {
    ...user,
    solved: [...(user.solved || []), challenge.id]
  };
  await updateUser(updated);
  return res.redirect("/challenges?msg=Flag%20accepted");
}

module.exports = { listChallenges, submitFlag };
