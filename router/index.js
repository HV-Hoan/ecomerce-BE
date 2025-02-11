var express = require('express');
var router = express.Router();


const user = require('../router/userRouter');
router.use('', user);

const product = require('../router/productRouter');
router.use('', product);


module.exports = router;