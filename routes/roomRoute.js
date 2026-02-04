const router = require("express").Router();
const { createRoom, updateRoom, deleteRoom, getRoom, getRooms } = require("../controllers/roomController");
const { verifyAdmin } = require("../middleware/verifyToken");
const upload = require("../middleware/upload");

router.post("/", verifyAdmin, upload.array('images', 5), createRoom);
router.put("/:id", verifyAdmin, upload.array('images', 5), updateRoom);
router.delete("/:id", verifyAdmin, deleteRoom);
router.get("/:id", getRoom);
router.get("/", getRooms);

module.exports = router;