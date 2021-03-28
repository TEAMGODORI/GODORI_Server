const express = require('express');
const router = express.Router();
const groupController = require('../../controller/groupController');

// 그룹 생성하기
router.post('/', groupController.postNewGroup);
router.get('/list/:userName', groupController.getGroupList);

module.exports = router;