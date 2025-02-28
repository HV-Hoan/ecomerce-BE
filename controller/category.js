const express = require('express');


const Category = require("../model/Category");

//lay danh sach loai
exports.ListCategory = async (req, res) => {
    const list_Category = await Category.findAll();
    return res.status(200).json({
        status: 200,
        message: "Lấy dữ liệu thành công",
        list_Category
    });
};

exports.PostCategory = async (req, res) => {
    try {
        const { name_Category, description_Category } = req.body;
        const newCategory = await Category.create({
            name_Category,
            description_Category
        });
        res.status(201).json({
            status: 201,
            message: "Thêm loại mới thành công",
            product: newCategory
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm sản phẩm', details: error.message });
    }
};

exports.DeleteCategory = async (req, res) => {
    try {
        const id_category = req.params.id; // Lấy id từ req.params
        const category = await Category.findByPk(id_category); // Tìm category theo id

        if (!category) {
            return res.status(404).json({ message: "Loại sản phẩm không tồn tại" });
        }

        await category.destroy(); // Xóa category

        res.status(200).json({ message: "Xóa loại sản phẩm thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra khi xóa loại sản phẩm" });
    }
};

// API sửa category
exports.PutCategory = async (req, res) => {
    const { id } = req.params;
    const { name_Category, description_Category } = req.body;

    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: "Loại này không tồn tại" });
        }

        // Cập nhật thông tin category
        category.name_Category = name_Category;
        category.description_Category = description_Category;

        await category.save();

        res.status(200).json({ message: "Cập nhật loại thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi cập nhật loại" });
    }
};



