const { DataTypes } = require("sequelize");
const sequelize = require("./connect");

const Category = sequelize.define("Category", {
    id_Category: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name_Category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description_Category: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "category",
    timestamps: false
});

module.exports = Category;