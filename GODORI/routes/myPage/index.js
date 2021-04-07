const express = require('express');
const router = express.Router();
const myPageController = require('../../controller/myPageController');
const myPage = require('../../models/group');

// 취향 수정하기
router.get('/:userName', myPageController.getMyPageInfo);

module.exports = router;