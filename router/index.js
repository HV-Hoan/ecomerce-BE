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

module.exports = router;