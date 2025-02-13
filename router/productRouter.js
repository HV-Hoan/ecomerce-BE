const express = require('express');
const router = express.Router();
const minioClient = require('../model/connect_MinIO');
const fs = require('fs');
const multer = require('multer');
const Product = require('../model/Product');
require('dotenv').config();
const host_name = process.env.ENDPOINT;
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


router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'Vui lòng chọn file' });

        const objectName = Date.now() + '-' + file.originalname;
        await minioClient.fPutObject(bucketName, objectName, file.path);

        const fileUrl = `http://${host_name}:9000/${bucketName}/${objectName}`;

        await Product.create({ file_name: objectName, file_url: fileUrl });

        fs.unlinkSync(file.path);
        res.json({ success: true, message: 'Upload thành công', fileUrl });

    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi upload file', details: error.message });
    }
});

//truyen tham so de download
router.get('/download/:id', async (req, res) => {
    try {
        const fileData = await Product.findByPk(req.params.id);
        if (!fileData) {
            return res.status(404).json({ error: 'File không tồn tại trong cơ sở dữ liệu' });
        }

        const { file_name } = fileData; // 
        console.log(`🔍 Đang tìm file: ${file_name}`);

        // kiem tra tren mino
        try {
            await minioClient.statObject(bucketName, file_name);
        } catch (err) {
            return res.status(404).json({ error: 'File không tồn tại trên MinIO', file_name });
        }

        // neu co se tai ve
        const fileStream = await minioClient.getObject(bucketName, file_name);
        res.attachment(file_name);
        fileStream.pipe(res);

    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi tải file', details: error.message });
    }
});


module.exports = router;
