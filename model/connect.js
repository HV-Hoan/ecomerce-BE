const { Sequelize } = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize
    (
        process.env.DB_DATABASE,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: "160.30.21.71",
            dialect: "mysql",
            logging: false,
        });

sequelize.authenticate()
    .then(() => console.log("Connected to MySQL"))
    .catch(err => console.error("MySQL connection error:", err));

module.exports = sequelize;
