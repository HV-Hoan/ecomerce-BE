var express = require('express');
var router = express.Router();


const user = require('../router/userRouter');
router.use('', user);

const product = require('../router/productRouter');
router.use('', product);

const category = require("../router/categoryRouter");
router.use('', category);

const vote = require("../router/voteRouter");
router.use('', vote);

const comment = require("../router/commentRouter");
router.use('', comment);

const account = require("../controller/account");
router.use('', account);

const cart = require("../router/cartRouter");
router.use('', cart);

const order = require("../router/orderRouter");
router.use('', order);



module.exports = router;