const Minio = require('minio');
require('dotenv').config();

// Cấu hình kết nối MinIO
const minioClient = new Minio.Client({
    endPoint: process.env.ENDPOINT,
    port: process.env.PORT_MINIO,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESSKEY,
    secretKey: process.env.MINIO_SECRETKEY
});

// Kiểm tra kết nối bằng cách liệt kê các bucket
minioClient.listBuckets((err, buckets) => {
    if (err) {
        return console.log('Lỗi khi kết nối MinIO:', err);
    }
    console.log('Danh sách bucket:', buckets);
});
module.exports = minioClient;