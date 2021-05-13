const express = require('express');
const router = express.Router();
const userController = require('../../controller/userController');
const user = require('../../models/user');

// 첫 로그인
router.post('/', userController.login);
// 첫 로그인 판단
router.get('/:kakaoId', userController.isFirstLogin);
// 취향 수정하기
router.put('/:userName', userController.updateExPrefer);

module.exports = router;