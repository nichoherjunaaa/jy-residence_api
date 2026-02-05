const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 4 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webm'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Hanya file gambar (JPG, PNG) dan WebM yang diperbolehkan!"), false);
        }
    }
});

module.exports = upload;