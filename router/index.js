var express = require('express');
var router = express.Router();


const user = require('../router/userRouter');
router.use('', user);


module.exports = router;