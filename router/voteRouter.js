const express = require('express');
const router = express.Router();
const sequelize = require("../model/connect.js");
const Product = require('../model/Product');
const Vote = require('../model/Vote');
const authenticateToken = require('../middleware/authenticateToken');



router.get("/vote", async (req, res) => {
    try {
        const showList = await Vote.findAll();
        if (!showList) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy dữ liệu đánh giá"
            });
        }
        return res.status(200).json({
            status: 200,
            message: "Lấy dữ liệu thành công",
            showList
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        return res.status(500).json({
            status: 500,
            message: "Có lỗi xảy ra khi lấy danh sách đánh giá"
        });
    }
});
// Route để người dùng đánh giá sản phẩm
// Route để người dùng đánh giá sản phẩm
// API POST để đánh giá sản phẩm
router.post("/vote/:productId/rate", authenticateToken, async (req, res) => {
    const { productId } = req.params;  // Lấy id sản phẩm từ URL
    const { rating } = req.body;  // Lấy rating từ body
    const userId = req.user.id;  // Lấy id người dùng từ token

    // Kiểm tra rating hợp lệ (từ 1 đến 5)
    if (rating < 1 || rating > 5 || isNaN(rating)) {
        return res.status(400).json({ message: "Điểm đánh giá không hợp lệ. Điểm phải từ 1 đến 5." });
    }

    try {
        // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        const existingVote = await Vote.findOne({
            where: { id: userId, id_Product: productId },
        });

        // Nếu người dùng đã đánh giá rồi, trả về thông báo lỗi
        if (existingVote) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
        }

        // Thêm đánh giá mới vào bảng vote
        const newVote = await Vote.create({
            rating: parseFloat(rating),  // Chuyển rating thành float
            id: userId,  // id người dùng
            id_Product: productId,  // id sản phẩm
        });

        // Tính toán rating trung bình của sản phẩm trong bảng vote
        const result = await Vote.findAll({
            where: { id_Product: productId },
            attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "averageRating"]],  // Tính trung bình
            raw: true,
        });

        // Lấy rating trung bình, nếu không có thì gán bằng 0
        const averageRating = result[0]?.averageRating
            ? parseFloat(result[0].averageRating).toFixed(2)
            : 0;

        // Cập nhật cột averageRating trong bảng vote
        await Vote.update(
            { averageRating: averageRating },
            { where: { id_Product: productId } }
        );

        // Trả về kết quả đánh giá trung bình dưới dạng JSON
        res.json({ averageRating });
    } catch (error) {
        console.error("Lỗi khi đánh giá sản phẩm:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi đánh giá sản phẩm." });
    }
});





router.get("/top-rated-products", async (req, res) => {
    try {
        const topRatedProducts = await Product.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT AVG(rating)
                            FROM vote
                            WHERE vote.id_Product = Product.id_Product
                        )`),
                        "averageRating"
                    ]
                ]
            },
            order: [[sequelize.literal("averageRating"), "DESC"]],
            limit: 4,
        });

        if (!topRatedProducts || topRatedProducts.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy sản phẩm đánh giá cao"
            });
        }

        res.json({ products: topRatedProducts });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm top-rated:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi lấy danh sách sản phẩm." });
    }
});

module.exports = router;
