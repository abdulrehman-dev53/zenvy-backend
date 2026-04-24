import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", upload.single("image"), (req, res) => {
  try {
    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;