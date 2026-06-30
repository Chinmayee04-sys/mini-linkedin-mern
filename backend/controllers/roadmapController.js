const roadmaps = require("../data/roadmaps");
const User = require("../models/user");

const getRoles = (req, res) => {
  res.json(Object.keys(roadmaps));
};

const generateRoadmap = async (req, res) => {
  const { role } = req.body;
  if (!role || !roadmaps[role]) {
    return res.status(400).json({ message: "Invalid or missing role" });
  }

  const roadmap = { ...roadmaps[role] };
  let userSkills = [];

  if (req.user) {
    try {
      const user = await User.findById(req.user._id);
      userSkills = (user.skills || []).map(s => s.toLowerCase());
    } catch {}
  }

  const normalise = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const alreadyHave = [];
  const needToLearn = [];

  roadmap.missingSkills.forEach(s => {
    const norm = normalise(s);
    if (userSkills.some(us => norm.includes(us) || us.includes(norm))) {
      alreadyHave.push(s);
    } else {
      needToLearn.push(s);
    }
  });

  const total = roadmap.missingSkills.length;
  const known = alreadyHave.length;
  const fraction = total > 0 ? known / total : 0;

  const baseMonths = parseInt(roadmap.timeRequired);
  const adjustedMonths = Math.max(1, Math.round(baseMonths * (1 - fraction * 0.6)));
  const adjustedTime = adjustedMonths <= 1 ? "1 month" : `${adjustedMonths} months`;

  const { prerequisites, courses, projects, salary, description } = roadmap;

  res.json({
    description,
    prerequisites,
    alreadyHave,
    needToLearn,
    courses,
    projects,
    salary,
    timeRequired: adjustedTime,
    timeReduced: fraction > 0.2
  });
};

module.exports = { getRoles, generateRoadmap };
