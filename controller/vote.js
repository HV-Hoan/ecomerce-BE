const express = require('express');
const router = express.Router();
const sequelize = require("../dbs/connect");
const Product = require('../model/Product');
const Vote = require('../model/Vote');

// Lấy danh sách đánh giá
exports.GetVote = async (req, res) => {
    try {
        const showList = await Vote.findAll();
        if (showList.length === 0) {
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
};
exports.Get_Vote_from_product = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ message: "Thiếu productId" });
        }
        // Tìm thông tin đánh giá
        const vote = await Vote.findOne({
            where: { productId },
            attributes: ["averageRating"],
        });

        res.json({ averageRating: vote?.averageRating ?? 0 });
    } catch (error) {
        console.error("Lỗi khi lấy đánh giá sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};



// Đánh giá sản phẩm
exports.Rate_Product = async (req, res) => {
    const { productId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Kiểm tra rating hợp lệ (từ 1 đến 5)
    if (rating < 1 || rating > 5 || isNaN(rating)) {
        return res.status(400).json({ message: "Điểm đánh giá không hợp lệ. Điểm phải từ 1 đến 5." });
    }
    console.log("Header nhận được:", req.headers.authorization);
    try {
        // kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        const existingVote = await Vote.findOne({
            where: { userId: userId, productId: productId },
        });

        // nếu người dùng đã đánh giá rồi, trả về thông báo lỗi
        if (existingVote) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
        }

        await Vote.create({
            rating: parseFloat(rating),
            userId: userId,
            productId: productId,
        });

        // Tính toán rating trung bình và tổng số lượt đánh giá của sản phẩm
        const result = await Vote.findAll({
            where: { productId: productId },
            attributes: [
                [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],  // Tính trung bình rating
                [sequelize.fn("COUNT", sequelize.col("id")), "ratingCount"], // Tính tổng số lượt đánh giá
            ],
            raw: true,
        });

        const averageRating = result[0]?.averageRating ? parseFloat(result[0].averageRating).toFixed(2) : 0;
        const ratingCount = result[0]?.ratingCount ? parseInt(result[0].ratingCount, 10) : 0;

        await Vote.update(
            { averageRating: averageRating, ratingCount: ratingCount },
            { where: { productId: productId } }
        );
        res.json({ averageRating, ratingCount });
    } catch (error) {
        console.error("Lỗi khi đánh giá sản phẩm:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi đánh giá sản phẩm." });
    }
};


const { Sequelize } = require("sequelize");


exports.Top_Rate = async (req, res) => {
    try {
        // Lấy danh sách sản phẩm với số lượt đánh giá và điểm trung bình
        const ratedProducts = await Product.findAll({
            attributes: [
                "id",
                "name_Product",
                "price_Product",
                "image_Product",
                [Sequelize.literal(`(
                    SELECT IFNULL(AVG(v.rating), 0) 
                    FROM vote v 
                    WHERE v.productId = Product.id
                )`), "averageRating"],
                [Sequelize.literal(`(
                    SELECT COUNT(v.id) 
                    FROM vote v 
                    WHERE v.productId = Product.id
                )`), "ratingCount"]
            ],
            order: [[Sequelize.literal("ratingCount"), "DESC"]],
            limit: 4
        });

        if (ratedProducts.length > 0 && ratedProducts.some(p => p.dataValues.ratingCount > 0)) {
            // Nếu có sản phẩm có đánh giá, trả về danh sách này
            return res.json({ products: ratedProducts });
        }

        // Nếu không có sản phẩm nào có đánh giá, lấy toàn bộ danh sách sản phẩm
        const allProducts = await Product.findAll({
            attributes: ["id", "name_Product", "price_Product", "image_Product"],
            limit: 4
        });

        res.json({ products: allProducts });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm top-rated:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi lấy danh sách sản phẩm." });
    }
};