const express = require('express');
const router = express.Router();
const groupController = require('../../controller/groupController');

// 그룹 생성하기
router.post('/', groupController.postNewGroup);
// 그룹 목록 가져오기
router.get('/list/:userName', groupController.getGroupList);
// 그룹 상세보기
router.get('/detail/:groupId', groupController.getGroupDetail);
// 그룹 가입하기
router.post('/join/:userName', groupController.groupJoin);

module.exports = router;