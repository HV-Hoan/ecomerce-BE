// Middleware xác thực token (ví dụ trong file authMiddleware.js)
const jwt = require("jsonwebtoken");
require('dotenv').config();
const TOKEN = process.env.TOKEN

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có token" });

    jwt.verify(token, TOKEN, (err, user) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ" });

        req.user = user; // Lưu thông tin user vào req để dùng sau
        next();
    });
};

module.exports = authenticateToken;
