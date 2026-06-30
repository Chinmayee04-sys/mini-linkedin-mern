const express = require("express");

const router = express.Router();
const upload = require("../middleware/upload");

const { uploadImage, uploadResume } = require("../controllers/uploadController");

router.post("/", upload.single("image"), uploadImage);
router.post("/resume", upload.single("resume"), uploadResume);

module.exports = router;