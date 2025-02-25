const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const redis = require("redis");


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Kết nối Redis
const client = redis.createClient({
    socket: {
        host: '127.0.0.1',
        port: 6379
    }
});

// Bắt lỗi Redis
client.on("error", (err) => {
    console.error("Error connecting to Redis", err);
});

client.connect()
    .then(() => console.log("Connected to Redis"))
    .catch(err => console.error("Redis connection error:", err));

module.exports = client;