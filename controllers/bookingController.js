const coreApi = require("../config/midtrans");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

const createBooking = async (req, res) => {
    const orderId = `JYRES-${Date.now()}`;
    console.log(req.body)
    try {
        const { totalPrice, firstName, lastName, email, phone, roomId, userId, checkIn, checkOut, nights } = req.body;

        if (!totalPrice) {
            return res.status(400).json({ error: "Total price tidak valid!" });
        }

        const newBooking = new Booking({
            orderId,
            userId,
            roomId,
            checkIn,
            checkOut,
            nights,
            totalPrice: Math.round(Number(totalPrice)),
            guestName: `${firstName} ${lastName}`.trim(),
            guestEmail: email,
            phone: phone,
            status: "PENDING",
            paymentStatus: "UNPAID"
        });

        await newBooking.save();

        const parameter = {
            "payment_type": "gopay",
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": Math.round(Number(totalPrice))
            },
            "customer_details": {
                "first_name": firstName,
                "last_name": lastName || "",
                "email": email,
                "phone": phone
            }
        };

        const paymentResponse = await coreApi.charge(parameter);
        res.status(200).json({ success: true, booking: newBooking, payment: paymentResponse });

    } catch (error) {
        console.error("Validation/Midtrans Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};
const updateBooking = async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedBooking);
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteBooking = async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.status(200).json("Booking has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
};

const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).populate('roomId');
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { createBooking, updateBooking, deleteBooking, getBooking, getBookings };