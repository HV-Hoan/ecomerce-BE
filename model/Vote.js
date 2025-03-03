const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");
const User = require("./User");
const Product = require("./Product"); // Import model sản phẩm

const Vote = sequelize.define(
    "Vote",
    {
        id: {
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
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User, // Khóa ngoại liên kết với User
                key: "id",
            },
            onDelete: "CASCADE",
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Product, // Khóa ngoại liên kết với Product
                key: "id",
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
                fields: ["userId", "productId"], // Ngăn user đánh giá nhiều lần trên cùng một sản phẩm
            },
        ],
    }
);

Vote.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(Vote, { foreignKey: "userId", onDelete: "CASCADE" });

Vote.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });
Product.hasMany(Vote, { foreignKey: "productId", onDelete: "CASCADE" });


module.exports = Vote;
