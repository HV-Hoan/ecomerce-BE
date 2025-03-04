const express = require('express');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');



require('dotenv').config();
const TOKEN = process.env.TOKEN;

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.userRole },
            TOKEN,
            { expiresIn: "1h" }
        );
        res.json({ token });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});



app.post('/register', async (req, res) => {
    const { username, password, email, userRole = "user" } = req.body;

    try {
        const saltRounds = 10; // Số vòng băm 
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            userRole
        });

        await newUser.save();
        console.log("Đăng ký thành công", username);
        res.status(201).json({ message: "Đăng ký thành công" });
    } catch (error) {
        console.error("Đăng ký thất bại", error);
        res.status(400).json({ message: error.message });
    }
});


app.listen(5000, () => console.log('Swagger trên link http://localhost:5000/api-docs/'));
