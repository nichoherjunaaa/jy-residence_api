const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require("mongoose");
const path = require("path");
const { connectDB } = require('./config/db');
const passport = require("passport");
require("./config/passport");

const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "/uploads"), {
    setHeaders: (res) => {
        res.set("Access-Control-Allow-Origin", "*");
    }
}));
app.use(passport.initialize());

// Routes
const userRoute = require('./routes/userRoute');
const roomRoute = require('./routes/roomRoute');
const bookingRoute = require('./routes/bookingRoute');
const paymentRoute = require('./routes/paymentRoute');
app.use("/api/users", userRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api", paymentRoute);

connectDB();

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

