const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");
const User = require("./User");
const Product = require("./Product");

const Cart = sequelize.define("Cart", {
    id: {
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
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: "id",
        }
    },
    userId: {
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

Cart.belongsTo(Product, { foreignKey: "productId" }); // cart có 1 Product
Cart.belongsTo(User, { foreignKey: "userId" }); // cart thuộc về 1 User

module.exports = Cart;
