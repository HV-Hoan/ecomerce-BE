const express = require('express');
const router = express.Router();
const minioClient = require('../model/connect_MinIO');
const multer = require('multer');
const Product = require('../model/Product');
const Category = require('../model/Category');
const ProductCategory = require('../model/ProductCategory');
const host_name = process.env.ENDPOINT;
const bucketName = process.env.MINIO_BUCKETNAME;

// Cấu hình multer
const upload = multer({ storage: multer.memoryStorage() });

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
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
});

// Download file
router.get('/download/:file_name', async (req, res) => {
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
});

// Lấy danh sách sản phẩm
router.get('/product', async (req, res) => {
    try {
        const list_Product = await Product.findAll();
        res.status(200).json({
            status: 200,
            message: "Lấy dữ liệu thành công",
            list_Product
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách sản phẩm', details: error.message });
    }
});

// API lấy danh mục cùng sản phẩm liên quan
router.get('/category-with-products', async (req, res) => {
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
});


// Thêm sản phẩm mới
router.post("/product", async (req, res) => {
    const { name_Product, description, price_Product, image_Product, id_Category } = req.body;

    if (!Array.isArray(id_Category) || id_Category.length === 0) {
        return res.status(400).json({ error: 'Vui lòng cung cấp ít nhất một category cho sản phẩm.' });
    }

    try {
        // Thêm sản phẩm vào bảng product
        const newProduct = await Product.create({
            name_Product,
            description,
            price_Product,
            image_Product
        });

        // Thêm từng category vào bảng product_category
        for (const categoryId of id_Category) {
            const categoryExists = await Category.findByPk(categoryId);
            if (!categoryExists) {
                return res.status(400).json({
                    error: `Loại sản phẩm không hợp lệ: ${categoryId}`
                });
            }

            await ProductCategory.create({
                id_Product: newProduct.id_Product,
                id_Category: categoryId
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
});

module.exports = router;
