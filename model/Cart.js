const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");
const User = require("./User");
const Product = require("./Product"); // Import model sản phẩm

const Cart = sequelize.define("Cart", {
    id_Cart: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    price_Cart: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    id_Product: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product, // Khóa ngoại liên kết với Product
            key: "id_Product",
        }
    },
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Khóa ngoại liên kết với User
            key: "id",
        }
    }
},
    {
        tableName: "cart",
        timestamps: false,
    })
module.exports = Cart;