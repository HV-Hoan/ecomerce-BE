const express = require('express');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');


require('dotenv').config();
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const REFRESH_TOKENS = new Set();

const app = express();
// app.use(cors());
app.use(
    cors({
        origin: "http://localhost:3000", // Chỉ cho phép React frontend
        credentials: true, // Cho phép gửi cookies & token
    })
);
app.use(bodyParser.json());
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));



//nhảy vào giao diện swagger
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, 'router/api_docs.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

var indexRouter = require("./router/index");
app.use('/api', indexRouter);


const Product = require("./model/Product");
const Category = require("./model/Category");

// Gọi các hàm associate sau khi định nghĩa tất cả các model
Product.associate();
Category.associate();

const User = require("./model/User");

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
        }

        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.userRole },
            ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user.id, username: user.username },
            REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Lưu Refresh Token vào danh sách hợp lệ
        REFRESH_TOKENS.add(refreshToken);

        // Gửi Refresh Token qua cookie (HttpOnly, Secure)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        });

        res.json({ accessToken });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});
app.post("/refresh", (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken || !REFRESH_TOKENS.has(refreshToken)) {
        return res.sendStatus(403);
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        // Giữ nguyên role khi tạo Access Token mới
        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        res.json({ accessToken: newAccessToken });
    });
});

app.post("/logout", (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        REFRESH_TOKENS.delete(refreshToken);
        res.clearCookie("refreshToken");
    }

    res.sendStatus(204);
});
app.post('/register', async (req, res) => {
    const { username, password, email, userRole = "user" } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            userRole
        });

        console.log("Đăng ký thành công", username);
        res.status(201).json({ message: "Đăng ký thành công" });
    } catch (error) {
        console.error("Đăng ký thất bại", error);
        res.status(400).json({ message: error.message });
    }
});

app.listen(5000, () => console.log('Swagger trên link http://localhost:5000/api-docs/'));
