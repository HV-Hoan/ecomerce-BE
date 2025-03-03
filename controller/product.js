const express = require('express');
const router = express.Router();
const minioClient = require('../dbs/connect_MinIO');
const multer = require('multer');
const Product = require('../model/Product');
const Category = require('../model/Category');
const ProductCategory = require('../model/ProductCategory');
const CheckRole = require('../middleware/authenticateToken');
const host_name = process.env.ENDPOINT;
const bucketName = process.env.MINIO_BUCKETNAME;

// Cấu hình multer
const upload = multer({ storage: multer.memoryStorage() });

// Upload file
exports.Uploads = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'Vui lòng chọn file' });

        const objectName = Date.now() + '-' + file.originalname;

        // Tải file lên MinIO
        await minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
            'Content-Type': file.mimetype
        });

        const fileUrl = `http://${host_name}:9000/${bucketName}/${objectName}`;
        res.json({ success: true, message: 'Upload thành công', fileUrl });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi upload file', details: error.message });
    }
};

// Download file
exports.Dowload = async (req, res) => {
    try {
        const fileName = req.params.file_name;

        // Kiểm tra file tồn tại trên MinIO
        await minioClient.statObject(bucketName, fileName);

        const fileStream = await minioClient.getObject(bucketName, fileName);
        res.attachment(fileName);
        fileStream.pipe(res);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi tải file', details: error.message });
    }
};

// Lấy danh sách sản phẩm
exports.GetProduct = async (req, res) => {
    try {
        const list_Product = await Product.findAll({
            order: [["id", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            message: "Lấy dữ liệu thành công",
            list_Product
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm", details: error.message });
    }
};

exports.GetDetailProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: 400, message: "Thiếu ID sản phẩm" });
        }

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ status: 404, message: "Không tìm thấy sản phẩm" });
        }

        res.status(200).json({
            status: 200,
            message: "Lấy dữ liệu thành công",
            product
        });
    } catch (error) {
        console.error("Lỗi API:", error);
        res.status(500).json({ status: 500, message: "Lỗi server" });
    }
};


// API lấy danh mục cùng sản phẩm liên quan
exports.Get_category_with_products = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: {
                model: Product,
                through: "ProductCategory" // Bảng trung gian
            }
        });

        return res.status(200).json({ list_Category: categories });
    } catch (error) {
        return res.status(500).json({ error: 'Lỗi khi lấy danh sách', details: error.message });
    }
};



exports.PostProduct = async (req, res) => {
    const { name_Product, description, price_Product } = req.body;
    let categoryId = req.body.categoryId;


    if (!categoryId) {
        return res.status(400).json({ error: "Vui lòng cung cấp ít nhất một category cho sản phẩm." });
    }

    // Nếu categoryId là chuỗi (khi gửi từ FormData), chuyển thành mảng
    if (typeof categoryId === "string") {
        try {
            categoryId = JSON.parse(categoryId);
        } catch (error) {
            categoryId = [categoryId]; // Trường hợp chỉ có 1 category, không phải JSON
        }
    }

    if (!Array.isArray(categoryId) || categoryId.length === 0) {
        return res.status(400).json({ error: "Vui lòng cung cấp ít nhất một category cho sản phẩm." });
    }

    try {
        let image_Product = null;
        if (req.file) {
            const file = req.file;
            const objectName = Date.now() + '-' + file.originalname;

            await minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
                'Content-Type': file.mimetype
            });

            image_Product = `http://${host_name}:9000/${bucketName}/${objectName}`;
        }

        // Tạo sản phẩm mới
        const newProduct = await Product.create({
            name_Product,
            description,
            price_Product,
            image_Product
        });

        // Thêm từng category vào bảng product_category
        for (const catId of categoryId) {
            const categoryExists = await Category.findByPk(catId);
            if (!categoryExists) {
                return res.status(400).json({
                    error: `Loại sản phẩm không hợp lệ: ${catId}`
                });
            }

            await ProductCategory.create({
                productId: newProduct.id,
                categoryId: catId
            });
        }

        res.status(201).json({
            status: 201,
            message: "Thêm sản phẩm thành công",
            product: newProduct
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm sản phẩm', details: error.message });
    }
};


//sua product
exports.PutProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name_Product, price_Product, description, status_Product } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        let newImageUrl = product.image_Product;

        if (req.file) {
            const file = req.file;
            const objectName = Date.now() + '-' + file.originalname;


            await minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
                'Content-Type': file.mimetype
            });

            newImageUrl = `http://${host_name}:9000/${bucketName}/${objectName}`;
        }

        await product.update({
            name_Product,
            price_Product,
            description,
            status_Product,
            image_Product: newImageUrl
        });

        res.json({ message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', details: error.message });
    }
};
exports.DeleteProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại." });
        }

        // Xóa sản phẩm, các bản ghi liên quan trong bảng vote sẽ tự động bị xóa nếu `ON DELETE CASCADE` được cấu hình đúng
        await product.destroy();
        return res.status(200).json({ message: "Xóa sản phẩm và các liên kết thành công." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Có lỗi xảy ra khi xóa sản phẩm." });
    }
};

// co ca category
exports.Delete_with_product_category = async (req, res) => {
    const { productId, categoryId } = req.params;

    try {
        // Kiểm tra sự tồn tại của product và category
        const productCategory = await ProductCategory.findOne({
            where: {
                productId: productId,
                categoryId: categoryId
            }
        });

        if (!productCategory) {
            return res.status(404).json({ error: "Sản phẩm hoặc danh mục không tồn tại" });
        }

        // xóa mối quan hệ giữa product và category trong bảng ProductCategory
        await productCategory.destroy();

        // xóa sản phẩm nếu cần (nếu không muốn xóa hoàn toàn, chỉ xóa liên kết thì bỏ phần này)
        await Product.destroy({ where: { productId: productId } });

        res.status(200).json({ message: "Xóa sản phẩm thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Có lỗi xảy ra khi xóa sản phẩm" });
    }
};