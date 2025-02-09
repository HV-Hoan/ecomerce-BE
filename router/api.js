const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Generates a JWT token for authentication
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Unauthorized
 */
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin") {
        const token = jwt.sign({ username }, "SECRET_KEY", { expiresIn: "1h" });
        return res.json({ token });
    }
    res.status(401).json({ message: "Unauthorized" });
});

/**
 * @swagger
 * /protected:
 *   get:
 *     summary: Protected route
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Protected
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
router.get("/protected", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, "SECRET_KEY", (err, user) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        res.json({ message: "Access granted", user });
    });
});

module.exports = router;
