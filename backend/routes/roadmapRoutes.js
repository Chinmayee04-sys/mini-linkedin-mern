const express = require("express");
const router = express.Router();
const { getRoles, generateRoadmap } = require("../controllers/roadmapController");
const protect = require("../middleware/authMiddleware");

router.get("/roles", getRoles);
router.post("/generate", protect, generateRoadmap);

module.exports = router;
