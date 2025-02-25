const express = require('express');
const router = express.Router();
const CheckRole = require('../middleware/authenticateToken');

const Comment = require("../model/Comment");
const User = require("../model/User");


exports.PostComment = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user?.id;
        const { comment } = req.body;

        console.log("Dữ liệu nhận được:", { productId, userId, comment });

        if (!userId) return res.status(401).json({ error: "Người dùng chưa đăng nhập" });
        if (!productId) return res.status(400).json({ error: "Thiếu id sản phẩm" });
        if (!comment?.trim()) return res.status(400).json({ error: "Nội dung bình luận không được để trống" });

        // Tạo bình luận mới
        const newComment = await Comment.create({
            id: userId,  // 
            id_Product: productId,
            comment,
            createdAt: new Date()
        });

        res.json({ message: "Thêm bình luận thành công", comment: newComment });
    } catch (error) {
        console.error("Lỗi khi thêm bình luận:", error);
        res.status(500).json({ error: "Lỗi khi thêm bình luận", details: error.message });
    }
};


exports.GetComment = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) return res.status(400).json({ error: "Thiếu id sản phẩm" });

        const comments = await Comment.findAll({
            where: { id_Product: productId },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    attributes: ["fullname", "image_avatar"],
                },
            ],
        });

        res.json({ comments });
    } catch (error) {
        console.error("Lỗi khi lấy bình luận:", error);
        res.status(500).json({ error: "Lỗi khi lấy bình luận", details: error.message });
    }
};
