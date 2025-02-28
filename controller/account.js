const express = require("express");
const cors = require("cors");
var router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require('dotenv').config();
const client = require("../dbs/connect_Redis");

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
        const isRegistered = await client.get(`registered:${email}`);
        if (isRegistered) {
            return res.status(400).json({ success: false, message: "Email này đã được đăng ký!" });
        }

        // lấy OTP từ Redis
        const storedOtp = await client.get(email);
        if (storedOtp === otp) {
            // xác thực thành công, đánh dấu email đã đăng ký
            await client.set(`registered:${email}`, "true"); // đánh dấu email đã đăng ký
            await client.del(email); // xóa OTP sau khi xác thực thành công
            res.json({ success: true, message: "Đăng ký thành công!" });
        } else {
            res.status(400).json({ success: false, message: "Sai mã xác thực" });
        }
    } catch (error) {
        console.error("Lỗi khi xác thực OTP:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
});

module.exports = router;