const { DataTypes } = require("sequelize");
const sequelize = require("./connect");

const User = sequelize.define("User", {
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    fullname: { type: DataTypes.STRING, allowNull: false },
    image_Avatar: { type: DataTypes.STRING, allowNull: false },
    userRole: {
        type: DataTypes.ENUM("admin", "user"),
        defaultValue: "user",
    }
}, {
    tableName: "user",
    timestamps: false
});

module.exports = User;
