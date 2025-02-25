var express = require('express');
var router = express.Router();
const ctrlUser = require("../controller/user");


router.get('/user', ctrlUser.GetUser);

router.post('/user', ctrlUser.PostUser);

router.put('/user/:id', ctrlUser.PutUser);

router.delete('/user/:id', ctrlUser.DelUser);

module.exports = router;