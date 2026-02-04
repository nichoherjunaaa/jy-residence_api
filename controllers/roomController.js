const Room = require("../models/Room");

// Create a room
const createRoom = async (req, res) => {
    if (!req.body.name || !req.body.price || !req.body.type || !req.body.capacity) {
        return res.status(400).json("Please fill all required fields!");
    }

    try {
        let images = [];
        if (req.files) {
            images = req.files.map(file => `/uploads/${file.filename}`);
        }

        const newRoom = new Room({
            ...req.body,
            images: images
        });

        const savedRoom = await newRoom.save();
        res.status(200).json(savedRoom);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Update a room
const updateRoom = async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (req.files && req.files.length > 0) {
            const images = req.files.map(file => `/uploads/${file.filename}`);
            updateData.images = images;
        }

        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        res.status(200).json(updatedRoom);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete a room
const deleteRoom = async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json("Room has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get a room
const getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        res.status(200).json(room);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get all rooms
const getRooms = async (req, res) => {
    try {
        const limit = req.query.limit;

        const rooms = limit
            ? await Room.find().limit(Number(limit))
            : await Room.find();

        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch rooms",
            error: err.message,
        });
    }
};


module.exports = { createRoom, updateRoom, deleteRoom, getRoom, getRooms };