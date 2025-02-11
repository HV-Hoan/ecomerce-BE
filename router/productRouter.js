const express = require('express');
const router = express.Router();
const minioClient = require('../model/connect_MinIO'); // Kết nối MinIO
const fs = require('fs'); // Thư viện xử lý file
const multer = require('multer');
const Product = require('../model/Product'); // Import Model Product
require('dotenv').config();

const bucketName = process.env.MINIO_BUCKETNAME;

// Cấu hình multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 📌 API UPLOAD FILE
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'Vui lòng chọn file' });

        const objectName = Date.now() + '-' + file.originalname; // Đặt tên file mới
        await minioClient.fPutObject(bucketName, objectName, file.path);

        const fileUrl = `http://127.0.0.1:9000/${bucketName}/${objectName}`;

        // 🛠 Lưu đúng tên file (objectName) vào MySQL
        await Product.create({ file_name: objectName, file_url: fileUrl });

        fs.unlinkSync(file.path);
        res.json({ success: true, message: 'Upload thành công', fileUrl });

    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi upload file', details: error.message });
    }
});


// 📌 API DOWNLOAD FILE
router.get('/download/:id', async (req, res) => {
    try {
        const fileData = await Product.findByPk(req.params.id);
        if (!fileData) {
            return res.status(404).json({ error: 'File không tồn tại trong cơ sở dữ liệu' });
        }

        const { file_name } = fileData; // 🔍 Lấy tên file đúng từ MySQL
        console.log(`🔍 Đang tìm file: ${file_name}`);

        // Kiểm tra file trên MinIO
        try {
            await minioClient.statObject(bucketName, file_name);
        } catch (err) {
            return res.status(404).json({ error: 'File không tồn tại trên MinIO', file_name });
        }

        // Nếu file tồn tại, tải về
        const fileStream = await minioClient.getObject(bucketName, file_name);
        res.attachment(file_name);
        fileStream.pipe(res);

    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi tải file', details: error.message });
    }
});


module.exports = router;
