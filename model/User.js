const { DataTypes } = require("sequelize");
const sequelize = require("../dbs/connect");

const User = sequelize.define("User", {
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    fullname: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
    image_Avatar: { type: DataTypes.STRING, allowNull: true },
    userRole: {
        type: DataTypes.ENUM("admin", "user"),
        defaultValue: "user",
    }
}, {
    tableName: "user",
    timestamps: false
});


module.exports = User;
