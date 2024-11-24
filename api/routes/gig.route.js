import express from "express";
import {
  createGig,
  deleteGig,
  getGig,
  getGigs,
} from "../controllers/gig.controller.js";
import { verifyToken } from "../middleware/jwt.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url"; 
import { dirname } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
router.post("/", verifyToken, createGig);
router.delete("/:id", verifyToken, deleteGig);
router.get("/single/:id", getGig);
router.get("/", getGigs);

router.post("/upload", async (req, res) => {
  try {
    const { image } = req.body;

    // Decode base64 string into binary data (buffer)
    const buffer = Buffer.from(image, "base64");

    // Define the uploads directory path
    const uploadsDir = path.join(__dirname, "../uploads");

    // Check if the directory exists, if not, create it
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Define a unique filename
    const filename = `image_${Date.now()}.png`;

    // Save the file to the uploads directory
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Respond with the file path or URL
    res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
