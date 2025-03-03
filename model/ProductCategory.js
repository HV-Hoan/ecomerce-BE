const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");

const ProductCategory = sequelize.define("ProductCategory", {
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "product_category",
    timestamps: false
});

module.exports = ProductCategory;
