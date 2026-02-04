const router = require("express").Router();
const { getUsers, getUser, createUser, loginUser, updateUser, deleteUser, getCurrentUser, googleAuthSuccess } = require("../controllers/userController");
const { verifyAdmin, verifyUser, verifyToken } = require("../middleware/verifyToken");
const passport = require("passport");

router.post("/register", createUser);
router.post("/login", loginUser);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// URL tempat Google mengirim data balik
router.get("/google/callback",
    passport.authenticate("google", { session: false }),
    googleAuthSuccess
);

router.get("/", verifyAdmin, getUsers);
router.get("/me", verifyToken, getCurrentUser);
router.get("/:id", verifyUser, getUser);
router.put("/:id", verifyUser, updateUser);
router.delete("/:id", verifyAdmin, deleteUser);
module.exports = router;