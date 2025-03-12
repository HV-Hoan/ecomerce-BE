const express = require('express');
const Order = require("../model/Order");
const OrderDetail = require("../model/OrderDetail");
const User = require("../model/User");
const Product = require("../model/Product");



exports.PostOrder = async (req, res) => {
    try {
        const { userId, price, quantity, status_Order, payment_method, payment_status, products } = req.body;

        if (!userId || !price || !products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc hoặc danh sách sản phẩm rỗng!" });
        }

        const newOrder = await Order.create({
            userId,
            price,
            quantity,
            status_Order: status_Order || "0",
            payment_method: payment_method || "0",
            payment_status: payment_status || "0"
        });

        const orderDetails = products.map((product) => {
            if (!product.id || !product.quantity) {
                console.warn(` Thiếu thông tin sản phẩm (id: ${product.id})`);
                return null;
            }
            return {
                orderId: newOrder.id,
                productId: product.id,
                userId: userId,
                quantity: product.quantity
            };
        }).filter(Boolean); // Lọc bỏ các phần tử `null` nếu có sản phẩm thiếu thông tin

        if (orderDetails.length > 0) {
            await OrderDetail.bulkCreate(orderDetails);
            console.log(`Đã thêm ${orderDetails.length} sản phẩm vào OrderDetail`);
        } else {
            console.log("Không có sản phẩm hợp lệ nào được thêm vào OrderDetail.");
        }

        return res.status(201).json({
            message: "Tạo đơn hàng thành công!",
            order: newOrder
        });

    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ!" });
    }
};




exports.GetAll = async (req, res) => {
    try {
        const list_Order = await Order.findAll();
        res.status(200).json({
            status: 200,
            message: "Lấy dữ liệu thành công",
            list_Order
        });
    } catch (error) {
        console.log(error);

    }
}
exports.GetOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: OrderDetail,
                    include: [{ model: Product, attributes: ["id", "name_product", "image_product"] }]
                },
                {
                    model: User,
                    attributes: ["fullname", "address"]
                }
            ]
        });


        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        res.json(order);
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};


exports.UpdateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status_Order, payment_status } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
        }

        // Cập nhật thông tin đơn hàng
        await order.update({
            status_Order: status_Order || order.status_Order,
            payment_status: payment_status || order.payment_status
        });

        res.status(200).json({
            message: "Cập nhật đơn hàng thành công!",
            order
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật đơn hàng:", error);
        res.status(500).json({ message: "Lỗi máy chủ!" });
    }
};
exports.GetOrderByUser = async (req, res) => {
    try {
        const userId = req.user?.id; // Dùng optional chaining để tránh lỗi
        console.log("User ID:", userId);

        if (!userId) {
            return res.status(400).json({ message: "Thiếu userId! Vui lòng đăng nhập lại." });
        }

        const orders = await Order.findAll({
            where: { userId },
            include: [
                {
                    model: OrderDetail,
                    include: [
                        {
                            model: Product,
                            attributes: ["id", "name_product", "image_product", "price_product"]
                        }
                    ]
                }
            ]
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "Không có đơn hàng nào!" });
        }

        return res.status(200).json({ message: "Lấy đơn hàng thành công!", orders });
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng theo userId:", error);
        return res.status(500).json({ message: "Lỗi máy chủ!" });
    }
};

