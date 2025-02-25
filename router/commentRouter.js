const express = require('express');
const router = express.Router();
const CheckRole = require('../middleware/authenticateToken');
const ctrlComment = require("../controller/comment");




router.post("/comment/:productId", CheckRole, ctrlComment.PostComment);
router.get("/comment/:productId", ctrlComment.GetComment);

module.exports = router;