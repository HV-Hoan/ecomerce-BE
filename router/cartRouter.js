const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const ctrlCart = require("../controller/cart");


router.post("/cart/add/:productId", authenticateToken, ctrlCart.AddCart);

router.get("/cart/get/:userId", authenticateToken, ctrlCart.GetCart);

router.delete("/cart/remove/:productId", authenticateToken, ctrlCart.RemoveFromCart);
router.put("/cart/update/:productId", authenticateToken, ctrlCart.UpdateQuantity);



module.exports = router;