const jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.access_token || (authHeader && authHeader.split(" ")[1]);

    if (!token) {
        console.warn("VerifyToken: No token provided");
        return res.status(401).json("You are not authenticated!");
    }
    const secretKey = process.env.JWT_SECRET || "defaultkeysecret1231";
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.error("VerifyToken: JWT Error ->", err.message);
            return res.status(403).json("Token is not valid!");
        }
        
        req.user = user;
        next();
    });
};

const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.role === "admin") {
            next();
        } else {
            return res.status(403).json("You are not authorized!");
        }
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === "admin") {
            next();
        } else {
            return res.status(403).json("You are not authorized!");
        }
    });
};

module.exports = { verifyToken, verifyUser, verifyAdmin };
