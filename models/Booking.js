const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true },
    qtyRoom: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String },
    specialRequests: { type: String },
    status: {
        type: String,
        enum: ["PENDING", "PAID", "CANCELLED", "CHECKIN", "CHECKOUT", "EXPIRED"],
        default: "PENDING"
    },
    paymentStatus: {
        type: String,
        enum: ["UNPAID", "CHALLENGE", "SUCCESS", "FAILED", "EXPIRED"],
        default: "UNPAID"
    },
    paymentRawData: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);