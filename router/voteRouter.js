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

// API POST để đánh giá sản phẩm
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
        await Vote.create({
            rating: parseFloat(rating),  // Chuyển rating thành float
            id: userId,  // id người dùng
            id_Product: productId,  // id sản phẩm
        });

        // Tính toán rating trung bình và tổng số lượt đánh giá của sản phẩm
        const result = await Vote.findAll({
            where: { id_Product: productId },
            attributes: [
                [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],  // Tính trung bình rating
                [sequelize.fn("COUNT", sequelize.col("id_Vote")), "ratingCount"], // Tính tổng số lượt đánh giá
            ],
            raw: true,
        });

        const averageRating = result[0]?.averageRating ? parseFloat(result[0].averageRating).toFixed(2) : 0;
        const ratingCount = result[0]?.ratingCount ? parseInt(result[0].ratingCount, 10) : 0;

        // Cập nhật cột averageRating và ratingCount trong bảng vote
        await Vote.update(
            { averageRating: averageRating, ratingCount: ratingCount },
            { where: { id_Product: productId } }
        );

        // Trả về kết quả đánh giá trung bình và tổng số lượt đánh giá
        res.json({ averageRating, ratingCount });
    } catch (error) {
        console.error("Lỗi khi đánh giá sản phẩm:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi đánh giá sản phẩm." });
    }
});


// API lấy danh sách top-rated sản phẩm, sắp xếp theo ratingCount giảm dần
router.get("/top-rated-products", async (req, res) => {
    try {
        const topRatedProducts = await Product.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT AVG(v.rating)
                            FROM vote v
                            WHERE v.id_Product = Product.id_Product
                        )`),
                        "averageRating"
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(v.id_Vote)
                            FROM vote v
                            WHERE v.id_Product = Product.id_Product
                        )`),
                        "ratingCount"
                    ]
                ]
            },
            order: [[sequelize.literal("ratingCount"), "DESC"]],  // Sắp xếp theo ratingCount giảm dần
            limit: 4
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
