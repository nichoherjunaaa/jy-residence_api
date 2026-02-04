const router = require("express").Router();
const { createBooking, updateBooking, deleteBooking, getBooking, getBookings } = require("../controllers/bookingController");
const { verifyUser, verifyAdmin, verifyToken } = require("../middleware/verifyToken");

router.post("/", verifyToken, createBooking);
router.get("/my-bookings", verifyToken, getBookings);
router.put("/:id", verifyAdmin, updateBooking);
router.delete("/:id", verifyAdmin, deleteBooking);
router.get("/:id", verifyUser, getBooking);
// router.get("/", verifyAdmin, getBookings);

module.exports = router;