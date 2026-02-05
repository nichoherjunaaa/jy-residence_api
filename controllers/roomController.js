const Room = require("../models/Room");
const { put, del } = require('@vercel/blob');

const createRoom = async (req, res) => {
    console.log("Token yang terbaca:", process.env.BLOB_READ_WRITE_TOKEN ? "ADA" : "TIDAK ADA");
    if (!req.body.name || !req.body.price || !req.body.type || !req.body.capacity) {
        return res.status(400).json("Please fill all required fields!");
    }

    try {
        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            imageUrls = await Promise.all(
                req.files.map(async (file) => {
                    const blob = await put(`rooms/${Date.now()}-${file.originalname}`, file.buffer, {
                        access: 'public',
                        contentType: file.mimetype
                    });
                    return blob.url;
                })
            );
        }

        const newRoom = new Room({
            ...req.body,
            images: imageUrls
        });

        const savedRoom = await newRoom.save();
        res.status(200).json(savedRoom);

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


const updateRoom = async (req, res) => {
    try {
        const roomId = req.params.id;

        // 1. Cari data lama untuk mendapatkan URL gambar lama
        const oldRoom = await Room.findById(roomId);
        if (!oldRoom) return res.status(404).json("Room not found!");

        let updateData = { ...req.body };

        // 2. Cek apakah ada file baru yang diunggah
        if (req.files && req.files.length > 0) {

            // A. Hapus gambar lama dari Vercel Blob (opsional tapi disarankan)
            if (oldRoom.images && oldRoom.images.length > 0) {
                try {
                    // del() bisa menerima array URL untuk menghapus banyak file sekaligus
                    await Promise.all(oldRoom.images.map(url => del(url)));
                } catch (delError) {
                    console.error("Gagal menghapus file lama:", delError);
                    // Lanjut saja, jangan hentikan proses update jika hapus gagal
                }
            }

            // B. Upload gambar-gambar baru
            const newImageUrls = await Promise.all(
                req.files.map(async (file) => {
                    const blob = await put(`rooms/${Date.now()}-${file.originalname}`, file.buffer, {
                        access: 'public',
                        contentType: file.mimetype
                    });
                    return blob.url;
                })
            );

            // Masukkan array URL baru ke data yang akan di-update
            updateData.images = newImageUrls;
        }

        // 3. Update database
        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { $set: updateData },
            { new: true }
        );

        res.status(200).json(updatedRoom);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
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