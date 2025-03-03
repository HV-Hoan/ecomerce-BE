const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const ctrlVote = require("../controller/vote");



router.get("/vote", ctrlVote.GetVote);

router.get("/vote/:productId", ctrlVote.Get_Vote_from_product);
// API POST để đánh giá sản phẩm
router.post("/vote/:productId/rate", authenticateToken, ctrlVote.Rate_Product);

// API lấy danh sách top-rated sản phẩm, sắp xếp theo ratingCount giảm dần
router.get("/top-rated-products", ctrlVote.Top_Rate);

module.exports = router;
