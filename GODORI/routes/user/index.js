const express = require('express');
const router = express.Router();
const userController = require('../../controller/userController');
const user = require('../../models/user');

// 취향 수정하기
router.put('/:userName', userController.updateExPrefer);

module.exports = router;