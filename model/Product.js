const { DataTypes } = require("sequelize");
const sequelize = require("./connect");

const Product = sequelize.define("Product", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "product",
    timestamps: false
});

module.exports = Product;
