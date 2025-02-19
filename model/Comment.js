const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const Vote = require('./Vote');

const Comment = sequelize.define('Comment', {
    id_Comment: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comment: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'Comment',
    timestamps: false,
});

// Thiết lập quan hệ khóa ngoại
Comment.belongsTo(User, { foreignKey: 'id' });
User.hasMany(Comment, { foreignKey: 'id' });

module.exports = Comment;
