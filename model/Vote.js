const { DataTypes } = require("sequelize");
const sequelize = require("./connect");
const User = require("./User");
const Product = require("./Product"); // Import model sản phẩm

const Vote = sequelize.define(
    "Vote",
    {
        id_Vote: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        ratingCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        averageRating: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0.0,
        },
        status: {
            type: DataTypes.ENUM("0", "1"),
            allowNull: false,
            defaultValue: "1",//1 la chua danh gia /  0 la da danh gia
        },
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User, // Khóa ngoại liên kết với User
                key: "id",
            },
            onDelete: "CASCADE",
        },
        id_Product: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Product, // Khóa ngoại liên kết với Product
                key: "id_Product",
            },
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "vote",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["id", "id_Product"], // Ngăn user đánh giá nhiều lần trên cùng một sản phẩm
            },
        ],
    }
);

// Thiết lập quan hệ
Vote.belongsTo(User, { foreignKey: "id" });
User.hasMany(Vote, { foreignKey: "id" });

Vote.belongsTo(Product, { foreignKey: "id_Product" });
Product.hasMany(Vote, { foreignKey: "id_Product" });

module.exports = Vote;
