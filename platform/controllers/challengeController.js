const { getUserById, updateUser } = require("../models/userModel");
const { getAllChallenges, getChallengeById } = require("../models/challengeModel");

async function listChallenges(req, res) {
  const user = await getUserById(req.session.userId);
  if (!user) return res.redirect("/login");

  const challenges = await getAllChallenges();
  const availableChallenges = challenges.filter(c => !c.isEnded);
  const endedChallenges = challenges.filter(c => c.isEnded);

  const solvedSet = new Set(user.solved || []);
  const message = req.query.msg || "";
  const error = req.query.error || "";

  res.render("challenges", {
    user,
    availableChallenges,
    endedChallenges,
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

  if (challenge.isEnded) {
    return res.redirect("/challenges?error=This%20challenge%20has%20ended%20and%20no%20longer%20accepts%20flags");
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
