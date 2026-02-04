const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["single", "double", "suite"], required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    images: {
        type: [String],
        default: []
    },
    description: { type: String },
    amenities: {
        type: [String],
        default: []
    },
    tag: {
        type: String,
        enum: ['Promo', 'Limited', 'Best Seller', 'VIP', null],
        default: null
    },
    totalRoom: { type: Number, default: 1 },
    bookedDates: [{ start: Date, end: Date }],
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
