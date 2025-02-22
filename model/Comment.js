const { DataTypes } = require("sequelize");
const sequelize = require("./connect");
const User = require("./User");
const Product = require("./Product");

const Comment = sequelize.define(
    "Comment",
    {
        id_Comment: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id: { // là khóa chính trong bảng user
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        id_Product: { // là khóa chính trong bảng product
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Product,
                key: "id_Product",
            },
            onDelete: "CASCADE",
        },
        comment: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "comment",
        timestamps: true,
        updatedAt: false,
    }
);

// Thiết lập quan hệ khóa ngoại
Comment.belongsTo(User, { foreignKey: "id" });
User.hasMany(Comment, { foreignKey: "id" });

Comment.belongsTo(Product, { foreignKey: "id_Product" });
Product.hasMany(Comment, { foreignKey: "id_Product" });

module.exports = Comment;
