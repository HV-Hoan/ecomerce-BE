const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");
const User = require("./User");
const Product = require("./Product");

const Comment = sequelize.define(
    "Comment",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Product,
                key: "id",
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

Comment.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Comment, { foreignKey: "userId" });

Comment.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Comment, { foreignKey: "productId" });

module.exports = Comment;
