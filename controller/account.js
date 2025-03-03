const express = require("express");
const cors = require("cors");
var router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require('dotenv').config();
const client = require("../dbs/connect_Redis");
const User = require("../model/User");
const multer = require("multer");
const minioClient = require('../dbs/connect_MinIO');
const host_name = process.env.ENDPOINT;
const bucketName = process.env.MINIO_BUCKETNAME;


// Cấu hình email server
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL,
        pass: process.env.PASSWORD_GMAIL,
    }
});

// API gửi OTP
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = crypto.randomInt(100000, 999999).toString(); //OTP ngẫu nhiên 6 số
    await client.set(email, otp, { EX: 300 }); //sống 300s

    try {
        await transporter.sendMail({
            from: '"Your OTP" <rentify66668888@gmail.com>',
            to: email,
            subject: "Mã xác nhận đăng ký tài khoản",
            text: `Mã OTP của bạn là: ${otp}. Chỉ có tác dụng trong 5 phút.`,
        });

        res.json({ success: true, message: "OTP đã gửi thành công" });
    } catch (error) {
        console.error("Lỗi khi gửi OTP:", error);
        res.status(500).json({ success: false, message: "Hãy nhập đúng Email" });
    }
});

// API xác thực OTP và kiểm tra email đã đăng ký
router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email và OTP là bắt buộc" });
    }

    try {
        // kiểm tra xem email đã đăng ký chưa
        const isRegistered = await client.get(`email:${email}`);
        if (isRegistered) {
            return res.status(400).json({ success: false, message: "Email này đã được đăng ký!" });
        }
        console.log("Email nhận được:", email);
        console.log("OTP nhập vào:", otp);

        const storedOtp = await client.get(email);
        console.log("OTP lưu trong Redis:", storedOtp);
        if (storedOtp === otp) {
            await client.set(`email:${email}`, "true", { EX: 86400 });
            await client.del(email);
            res.json({ success: true, message: "Đăng ký thành công!" });
        } else {
            res.status(400).json({ success: false, message: "Sai mã xác thực" });
        }
    } catch (error) {
        console.error("Lỗi khi xác thực OTP:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
});


router.get("/account/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!id || isNaN(id)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Cấu hình multer
const upload = multer({ storage: multer.memoryStorage() });

router.put("/account/:id", upload.single("image_Avatar"), async (req, res) => {
    const userId = req.params.id;
    const { fullname, address } = req.body;


    try {
        // Tìm user theo ID
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }
        let image_Avatar = null;
        if (req.file) {
            const file = req.file;
            const objectName = Date.now() + '-' + file.originalname;

            await minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
                'Content-Type': file.mimetype
            });

            image_Avatar = `http://${host_name}:9000/${bucketName}/${objectName}`;
        }
        // Chỉ cập nhật fullname, address và image_Avatar
        await user.update({
            fullname: fullname || user.fullname,
            address: address || user.address,
            image_Avatar: image_Avatar || user.image_Avatar, // Giữ nguyên ảnh cũ nếu không có ảnh mới
        });

        res.json({
            message: "Cập nhật thông tin thành công!",
            updatedUser: {
                username: user.username, // Giữ nguyên username
                email: user.email, // Giữ nguyên email
                fullname: user.fullname,
                address: user.address,
                image_Avatar: user.image_Avatar,
            },
        });
    } catch (error) {
        console.error("Lỗi cập nhật user:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật thông tin." });
    }
});

module.exports = router;