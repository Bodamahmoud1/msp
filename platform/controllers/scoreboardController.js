const { getAllUsers } = require("../models/userModel");
const { getAllChallenges } = require("../models/challengeModel");

async function showScoreboard(req, res) {
  const [users, challenges] = await Promise.all([
    getAllUsers(),
    getAllChallenges()
  ]);

  const pointsById = new Map(challenges.map((c) => [c.id, c.points]));

  const scores = users.map((u) => {
    const solved = u.solved || [];
    const total = solved.reduce((sum, id) => sum + (pointsById.get(id) || 0), 0);
    return {
      id: u.id,
      username: u.username,
      displayName: u.displayName || u.username,
      solvedCount: solved.length,
      total
    };
  });

  scores.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.displayName.localeCompare(b.displayName);
  });

  res.render("scoreboard", { scores });
}

module.exports = { showScoreboard };
