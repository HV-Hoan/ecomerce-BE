const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");
const User = require("./User");


const Order = sequelize.define("Order", {
    id_Order: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Khóa ngoại liên kết với User
            key: "id",
        }
    },
    total_price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status_Order: {
        type: DataTypes.ENUM("0", "1", "2"), // Trạng thái đơn hàng 0 la đang chờ , 1 là hoàn thành, 2 là hủyhủy
        defaultValue: "0", // Mặc định là đang chờ 
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
},
    {
        tableName: "order",
        timestamps: false
    }
)

module.exports = Order;