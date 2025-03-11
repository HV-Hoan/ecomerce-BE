const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");


const OrderDetail = sequelize.define("OrderDetail", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "OrderDetail",
    timestamps: false
});



module.exports = OrderDetail;
