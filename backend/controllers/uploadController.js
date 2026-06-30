const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

const uploadImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let text = "";

    if (ext === ".txt") {
      text = fs.readFileSync(req.file.path, "utf8");
    } else if (ext === ".pdf") {
      const pdfParse = require("pdf-parse");
      const buf = fs.readFileSync(req.file.path);
      const data = await pdfParse(buf);
      text = data.text;
    } else if (ext === ".docx") {
      const mammoth = require("mammoth");
      const buf = fs.readFileSync(req.file.path);
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result.value;
    } else {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Unsupported file format. Use PDF, DOCX, or TXT." });
    }

    fs.unlinkSync(req.file.path);
    res.json({ text: text.trim(), filename: req.file.originalname });
  } catch (error) {
    try { fs.unlinkSync(req.file.path); } catch {}
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadImage, uploadResume };