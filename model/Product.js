const { DataTypes } = require("sequelize");
const sequelize = require("./connect");
const ProductCategory = require("./ProductCategory");

const Product = sequelize.define("Product", {
    id_Product: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name_Product: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price_Product: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status_Product: {
        type: DataTypes.ENUM("0", "1"), // 0 là còn hàng, 1 là hết hàng
        defaultValue: "0"
    },
    image_Product: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    ratingCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }

}, {
    tableName: "product",
    timestamps: false
});

Product.associate = () => {
    const Category = require("./Category");
    Product.belongsToMany(Category, {
        through: ProductCategory,
        foreignKey: "id_Product",
        otherKey: "id_Category"
    });
};

module.exports = Product;
