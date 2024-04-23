const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");

const pipeline = promisify(require("stream").pipeline);
const router = express.Router();

// Dynamic import of multer
let upload;

// Asynchronously initialize multer and routes
async function initialize() {
    const multer = (await import('multer')).default;
    upload = multer();

    router.post("/resume", upload.single("file"), async (req, res) => {
        const { file } = req;
        if (!file.detectedFileExtension || file.detectedFileExtension != ".pdf") {
            res.status(400).json({
                message: "Invalid format",
            });
        } else {
            const filename = `${uuidv4()}${file.detectedFileExtension}`;

            try {
                await pipeline(
                    file.stream,
                    fs.createWriteStream(`${__dirname}/../public/resume/${filename}`)
                );
                res.send({
                    message: "File uploaded successfully",
                    url: `/host/resume/${filename}`,
                });
            } catch (err) {
                res.status(400).json({
                    message: "Error while uploading",
                });
            }
        }
    });

    router.post("/profile", upload.single("file"), async (req, res) => {
        const { file } = req;
        if (!file.detectedFileExtension || (file.detectedFileExtension != ".jpg" && file.detectedFileExtension != ".png")) {
            res.status(400).json({
                message: "Invalid format",
            });
        } else {
            const filename = `${uuidv4()}${file.detectedFileExtension}`;

            try {
                await pipeline(
                    file.stream,
                    fs.createWriteStream(`${__dirname}/../public/profile/${filename}`)
                );
                res.send({
                    message: "Profile image uploaded successfully",
                    url: `/host/profile/${filename}`,
                });
            } catch (err) {
                res.status(400).json({
                    message: "Error while uploading",
                });
            }
        }
    });
}

initialize().catch(err => console.error("Failed to initialize routes:", err));

module.exports = router;
