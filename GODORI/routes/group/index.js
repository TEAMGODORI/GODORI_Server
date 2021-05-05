const express = require('express');
const router = express.Router();
const groupController = require('../../controller/groupController');
const group = require('../../models/group');

// 그룹 생성하기
router.post('/', groupController.postNewGroup);
// 그룹 목록 가져오기
router.get('/list/:userName', groupController.getGroupList);
// 이런 그룹 어때요 그룹 목록 가져오기
router.get('/before/list', groupController.getAnyGroupList);
// 그룹 상세보기
router.get('/detail/:groupId', groupController.getGroupDetail);
// 그룹 상세보기 (그룹 가입 후)
router.get('/after/detail/:groupId', groupController.getGroupDetailAfterSignUp);
// 그룹 가입하기
router.post('/join/:userName', groupController.groupJoin);
// 그룹 이름, 이번주 남은 운동 횟수, 모든 멤버 달성률 가져오기
router.get('/member/:userName', groupController.afterSignUpInfo);
// 그룹 검색하기
router.get('/', groupController.groupSearch);
// 그룹 탈퇴하기
router.put('/:userName', groupController.leaveGroup);

module.exports = router;