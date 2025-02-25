const express = require('express');
const router = express.Router();
const CheckRole = require('../middleware/authenticateToken');
const multer = require('multer');
const ctrlProduct = require("../controller/product");

// Cấu hình multer
const upload = multer({ storage: multer.memoryStorage() });


router.post('/upload', upload.single('file'), ctrlProduct.Uploads);
router.get('/download/:file_name', ctrlProduct.Dowload);
router.get('/product', ctrlProduct.GetProduct);

router.get("/product/:id", ctrlProduct.GetDetailProduct);

// API lấy danh mục cùng sản phẩm liên quan
router.get('/category-with-products', ctrlProduct.Get_category_with_products);

router.post("/product", upload.single("image_Product"), ctrlProduct.PostProduct);

//sua product
router.put("/product/:id", upload.single('image_Product'), ctrlProduct.PutProduct);

router.delete("/product/:id", ctrlProduct.DeleteProduct);

// co ca category
router.delete("/product/:productId/:categoryId", CheckRole, ctrlProduct.Delete_with_product_category);


module.exports = router;
