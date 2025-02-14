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
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    id_Category: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "category",
            key: "id_Category"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    }
}, {
    tableName: "product",
    timestamps: false
});

module.exports = Product;
