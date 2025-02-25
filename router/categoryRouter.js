const express = require('express');
const router = express.Router();
const ctrlCategory = require("../controller/category");
const Category = require("../model/Category");

//lay danh sach loai
router.get("/category", ctrlCategory.ListCategory);

router.post("/category", ctrlCategory.PostCategory);

router.delete("/category/:id", ctrlCategory.DeleteCategory);

// API sửa category
router.put("/category/:id", ctrlCategory.PutCategory);



module.exports = router;