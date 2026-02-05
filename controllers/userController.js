const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get a user
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json("User not found!");
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
};


// Di userController.js
const googleAuthSuccess = async (req, res) => {
    try {
        const email = req.user.emails[0].value;
        const name = req.user.displayName;
        const profilePic = req.user.photos ? req.user.photos[0].value : "";

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                profilePicture: profilePic,
                password: await bcrypt.hash("oauth_" + Math.random(), 10),
                role: "user"
            });
            await user.save();
        }
        console.log(user);

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "5d" }
        );
        res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}`);
    } catch (err) {
        console.error("Google Auth Error:", err);
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
};


// Create a user (Register)
const createUser = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json("Please fill all required fields!");
    }

    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json("Email already exists!");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            phone: req.body.phone,
            role: req.body.role || "user"
        });

        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Login user
const loginUser = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json("Please fill all required fields!");
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json("User not found!");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password!");

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "default_secret_key",
            { expiresIn: "5d" }
        );

        const { password, ...others } = user._doc;
        res
            .cookie("access_token", token, { httpOnly: true })
            .status(200)
            .json({ ...others, token }); // Return token in body as well for convenience
    } catch (err) {
        res.status(500).json(err);
    }
};

const getCurrentUser = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json("User not found!");
    res.status(200).json({ user });
};

// Update user
const updateUser = async (req, res) => {
    if (req.body.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
            return res.status(500).json(err);
        }
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { getUsers, getUser, createUser, loginUser, updateUser, deleteUser, getCurrentUser, googleAuthSuccess };