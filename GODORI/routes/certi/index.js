const express = require('express');
const router = express.Router();
const upload = require('../../modules/multer');
const certiController = require('../../controller/certiController');

// 인증 게시물 업로드
router.post('/:userName', upload.array('images'), certiController.postNewCerti);
// 인증 게시물 상세보기
router.get('/detail/:userName', certiController.getCertiDetail);
// 해당 날짜의 인증 게시물 가져오기
router.get('/:userName', certiController.getCertiByCal);
// 좋아요, 좋아요 취소
router.put('/like/:userName', certiController.likeOrCancel);

module.exports = router;