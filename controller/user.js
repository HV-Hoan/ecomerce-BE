var express = require('express');
var router = express.Router();
const User = require("../model/User");
require('dotenv').config();

const cors = require('cors');
router.use(cors({ origin: "*" }));

exports.GetUser = async (req, res) => {
    const showList = await User.findAll();
    return res.status(200).json({
        status: 200,
        message: "Lấy dữ liệu thành công",
        showList
    });
};

exports.PostUser = async (req, res) => {
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
};



exports.PutUser = async (req, res) => {
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
};

exports.DelUser = async (req, res) => {
    const id = req.params;
    if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ!" });
    }
    await User.destroy(id);
};
