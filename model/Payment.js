const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");
const Order = require("./Order");



const Payment = sequelize.define("Payment", {
    id_Payment: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_Order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order,
            key: "id_Order",
        }
    },
    payment_status: {
        type: DataTypes.ENUM("0", "1", "2"), //0 là đang đợi, 1 là hoàn thành, 2 là hủyhủy
        defaultValue: "1",
        allowNull: false
    },
    payment_method: {
        type: DataTypes.ENUM("0", "1", "2"), // 0 là tiền mặt. 1 là thẻ, 2 là paypal
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }

},
    {
        tableName: "payment",
        timestamps: false
    }
)

module.exports = Payment;