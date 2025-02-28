const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");
const User = require("./User");
const Product = require("./Product");

const Cart = sequelize.define("Cart", {
    id_Cart: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    price_Cart: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    id_Product: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: "id_Product",
        }
    },
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        }
    }
},
    {
        tableName: "cart",
        timestamps: false,
    });

// ✅ Thiết lập mối quan hệ
Cart.belongsTo(Product, { foreignKey: "id_Product" }); // Cart có 1 Product
Cart.belongsTo(User, { foreignKey: "id" }); // Cart thuộc về 1 User

module.exports = Cart;
