const express = require('express');
const router = express.Router();
const minioClient = require('../model/connect_MinIO');
const multer = require('multer');
const Product = require('../model/Product');
const Category = require('../model/Category');
const ProductCategory = require('../model/ProductCategory');
const Vote = require('../model/Vote');
const CheckRole = require('../middleware/authenticateToken');
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

router.post("/product", upload.single("image_Product"), async (req, res) => {
    const { name_Product, description, price_Product, id_Category } = req.body;

    if (!Array.isArray(id_Category) || id_Category.length === 0) {
        return res.status(400).json({ error: 'Vui lòng cung cấp ít nhất một category cho sản phẩm.' });
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

//sua product
router.put("/product/:id", upload.single('image_Product'), async (req, res) => {
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
});

router.delete("/product/:id", async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại." });
        }
        // kiểm tra xem sản phẩm có đang được sử dụng trong bảng khác k (foreign key constraint)
        const productCategory = await ProductCategory.findOne({ where: { id_Product: productId } });
        if (productCategory) {
            await ProductCategory.destroy({ where: { id_Product: productId } });
            console.log("Đã xóa các liên kết trong ProductCategory");

            // tiến hành xóa sản phẩm sau khi đã xử lý liên kết
            await product.destroy();
            return res.status(200).json({ message: "Xóa sản phẩm và các liên kết thành công." });
        }

        // xóa sản phẩm nếu không có liên kết
        await product.destroy();
        return res.status(200).json({ message: "Xóa sản phẩm thành công." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Có lỗi xảy ra khi xóa sản phẩm." });
    }
});
// co ca category
router.delete("/product/:productId/:categoryId", CheckRole, async (req, res) => {
    const { productId, categoryId } = req.params;

    try {
        // Kiểm tra sự tồn tại của product và category
        const productCategory = await ProductCategory.findOne({
            where: {
                id_Product: productId,
                id_Category: categoryId
            }
        });

        if (!productCategory) {
            return res.status(404).json({ error: "Sản phẩm hoặc danh mục không tồn tại" });
        }

        // xóa mối quan hệ giữa product và category trong bảng ProductCategory
        await productCategory.destroy();

        // xóa sản phẩm nếu cần (nếu không muốn xóa hoàn toàn, chỉ xóa liên kết thì bỏ phần này)
        await Product.destroy({ where: { id_Product: productId } });

        res.status(200).json({ message: "Xóa sản phẩm thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Có lỗi xảy ra khi xóa sản phẩm" });
    }
});


module.exports = router;
