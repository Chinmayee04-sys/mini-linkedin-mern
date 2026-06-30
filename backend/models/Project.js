const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  githubUrl: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationDetails: {
    readmeExists: Boolean,
    commitCount: Number,
    technologies: [String],
    hasDeployment: Boolean,
    lastCommitDate: Date,
    stars: Number
  },
  badges: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", projectSchema);
