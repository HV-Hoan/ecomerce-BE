const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");
const User = require("./User");

const Order = sequelize.define("Order", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status_Order: {
        type: DataTypes.ENUM("0", "1", "2"),
        defaultValue: "0",
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    payment_method: {
        type: DataTypes.ENUM("0", "1"),
        defaultValue: "0",
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM("0", "1", "2"),
        defaultValue: "0",
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    tableName: "order",
    timestamps: false
});

Order.belongsTo(User, { foreignKey: "userId" });

// Import OrderDetail sau khi Order đã được định nghĩa
const OrderDetail = require("./OrderDetail");
Order.hasMany(OrderDetail, { foreignKey: "orderId" });

module.exports = Order;
