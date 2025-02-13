const express = require('express');
const router = express.Router();

const Category = require("../model/Category");

//lay danh sach loai
router.get("/category", async (req, res) => {
    const list_Category = await Category.findAll();
    return res.status(200).json({
        status: 200,
        message: "Lấy dữ liệu thành công",
        list_Category
    });
})





module.exports = router;