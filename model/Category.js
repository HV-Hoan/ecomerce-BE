const { DataTypes } = require("sequelize");
const sequelize = require("./connect");
const Product = require("./Product"); // Import Product để thiết lập quan hệ
const ProductCategory = require("./ProductCategory"); // Import bảng trung gian

const Category = sequelize.define("Category", {
    id_Category: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name_Category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description_Category: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "category",
    timestamps: false
});

Category.associate = () => {
    const Product = require("./Product");
    Category.belongsToMany(Product, {
        through: ProductCategory,
        foreignKey: "id_Category",
        otherKey: "id_Product"
    });
};

module.exports = Category;
