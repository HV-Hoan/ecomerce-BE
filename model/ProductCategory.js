const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");

const ProductCategory = sequelize.define("ProductCategory", {
    id_Product: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_Category: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "product_category",
    timestamps: false
});

module.exports = ProductCategory;
