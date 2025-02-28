const Cart = require("../model/Cart");
const Product = require("../model/Product"); // Import model sản phẩm

exports.AddCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user?.id; // Lấy userId từ token

        console.log("🔍 Kiểm tra dữ liệu đầu vào:", { userId, productId, quantity });

        // Kiểm tra dữ liệu đầu vào
        if (!userId) return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
        if (!productId) return res.status(400).json({ message: "Thiếu productId!" });
        if (!quantity || isNaN(quantity) || quantity < 1) return res.status(400).json({ message: "Số lượng không hợp lệ!" });

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại!" });

        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        const existingCartItem = await Cart.findOne({
            where: { id: userId, id_Product: productId },
        });

        if (existingCartItem) {
            console.log("🔄 Cập nhật số lượng sản phẩm trong giỏ hàng");
            existingCartItem.quantity += parseInt(quantity, 10);
            await existingCartItem.save();
        } else {
            console.log("🆕 Thêm sản phẩm mới vào giỏ hàng");
            await Cart.create({ id: userId, id_Product: productId, quantity: parseInt(quantity, 10) });
        }

        res.status(200).json({ message: "Sản phẩm đã được thêm vào giỏ hàng!" });

    } catch (error) {
        console.error("❌ Lỗi server khi thêm vào giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
    }
};

exports.GetCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // Lấy danh sách sản phẩm trong giỏ hàng của user
        const cartItems = await Cart.findAll({
            where: { id: userId },
            include: [{ model: Product, attributes: ["name_Product", "price_Product", "image_Product"] }]
        });

        res.json({ cartItems });
    } catch (error) {
        console.error("❌ Lỗi khi lấy giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng!" });
    }
};


// 🆕 API xoá sản phẩm khỏi giỏ hàng
exports.RemoveFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: "Bạn chưa đăng nhập!" });

        const deleted = await Cart.destroy({ where: { id: userId, id_Product: productId } });

        if (deleted) {
            return res.json({ message: "Sản phẩm đã được xoá khỏi giỏ hàng!" });
        } else {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng!" });
        }
    } catch (error) {
        console.error("❌ Lỗi khi xoá sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
    }
};

// 🆕 API cập nhật số lượng sản phẩm
exports.UpdateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
        if (!quantity || isNaN(quantity) || quantity < 1) return res.status(400).json({ message: "Số lượng không hợp lệ!" });

        const cartItem = await Cart.findOne({ where: { id: userId, id_Product: productId } });

        if (!cartItem) return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng!" });

        cartItem.quantity = quantity;
        await cartItem.save();

        res.json({ message: "Cập nhật số lượng thành công!" });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật số lượng:", error);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại!" });
    }
};
