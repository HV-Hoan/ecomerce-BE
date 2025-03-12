const express = require('express');
const router = express.Router();
const ctrlOrder = require("../controller/order.js");
const authenticateToken = require('../middleware/authenticateToken');

router.post("/order/create", ctrlOrder.PostOrder);
router.get("/order/getall", ctrlOrder.GetAll);

router.get("/order/:id", ctrlOrder.GetOrderById);

router.get("/order/user/:userId", authenticateToken, ctrlOrder.GetOrderByUser);
router.put("/order/:orderId/update", ctrlOrder.UpdateOrder);

module.exports = router;