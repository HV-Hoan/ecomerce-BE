const express = require('express');
const router = express.Router();
const minioClient = require('../model/connect_MinIO');
const multer = require('multer');
const Product = require('../model/Product');
const Category = require('../model/Category');
require('dotenv').config();
const host_name = process.env.ENDPOINT;
const bucketName = process.env.MINIO_BUCKETNAME;

// Cấu hình multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'Vui lòng chọn file' });

        const objectName = Date.now() + '-' + file.originalname;

        // tải trực tiếp dữ liệu file từ bộ nhớ lên MinIO
        await minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
            'Content-Type': file.mimetype
        });

        const fileUrl = `http://${host_name}:9000/${bucketName}/${objectName}`;

        res.json({ success: true, message: 'Upload thành công', fileUrl });

    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi upload file', details: error.message });
    }
});

//truyen tham so de download
router.get('/download/:file_name', async (req, res) => {
    try {
        const fileName = req.params.file_name;
        console.log(`🔍 Đang tìm file: ${fileName}`);

        // liểm tra file trên MinIO
        try {
            await minioClient.statObject(bucketName, fileName);
        } catch (err) {
            return res.status(404).json({ error: 'File không tồn tại trên MinIO', file_name: fileName });
        }

        const fileStream = await minioClient.getObject(bucketName, fileName);
        res.attachment(fileName);
        fileStream.pipe(res);

    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi tải file', details: error.message });
    }
});


router.post("/product", async (req, res) => {
    const { file_name, description, file_url, id_Category } = req.body;

    try {
        // kiểm tra id_Category có tồn tại không
        const categoryExists = await Category.findByPk(id_Category);
        if (!categoryExists) {
            return res.status(400).json({
                error: 'Loại sản phẩm không hợp lệ. Vui lòng chọn từ danh sách Category có sẵn.'
            });
        }

        const newProduct = await Product.create({
            file_name,
            description,
            file_url,
            id_Category
        });

        return res.status(201).json({
            status: 201,
            message: "Thêm sản phẩm thành công",
            product: newProduct
        });

    } catch (error) {
        return res.status(500).json({ error: 'Lỗi khi thêm sản phẩm', details: error.message });
    }
});

module.exports = router;
