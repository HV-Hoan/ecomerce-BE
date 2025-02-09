var express = require('express');
var router = express.Router();
const User = require("../model/User");
require('dotenv').config();

const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
const cors = require('cors');
router.use(cors({ origin: "*" }));

router.get('/user', async (req, res) => {
    const showList = await User.findAll();
    return res.status(200).json({
        status: 200,
        message: "Lấy dữ liệu thành công",
        showList
    });
});

router.post('/user', async (req, res) => {
    const { username, password, userRole = "user" } = req.body;
    const newUser = new User({
        username,
        password,
        userRole
    })
    try {
        await newUser.save();
        console.log("Đăng ký thành công", username);
        res.status(201).json({ message: "Đăng ký thành công" });
    } catch (error) {
        console.error("Đăng ký thất bại", error);
        res.status(400).json({ message: error.message });
    }
});



router.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, userRole } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại" });
        }

        await user.update({ username, password, userRole });

        return res.json({ message: "Update thành công", data: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
    }
});

router.delete('/user/:id', (req, res) => {
    const id = parseInt(req.params.id, 10); // Chuyển id thành số nguyên

    if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ!" });
    }

    const sql = "DELETE FROM user WHERE id = ?";
    pool.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Lỗi khi xóa dữ liệu:", err);
            return res.status(500).json({ message: "Lỗi khi xóa dữ liệu!" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }
        res.json({ message: "Xóa thành công!" });
    });
});


module.exports = router;