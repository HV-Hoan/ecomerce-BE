const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");
const ProductCategory = require("./ProductCategory"); // Import bảng trung gian

const Category = sequelize.define("Category", {
    id: {
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
        foreignKey: "categoryId",
        otherKey: "productId",
        onDelete: "CASCADE"
    });
};

module.exports = Category;
