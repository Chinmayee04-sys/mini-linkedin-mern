const express = require("express");
const router = express.Router();
const { verifyProject, getUserProjects } = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

router.post("/verify", protect, verifyProject);
router.get("/user/:userId", getUserProjects);
router.get("/my", protect, getUserProjects);

module.exports = router;
