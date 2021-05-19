const express = require('express');
const router = express.Router();
const upload = require('../../modules/multer');
const certiController = require('../../controller/certiController');

// 인증 게시물 내용 업로드
router.post('/:kakaoId', certiController.postCertiBody);
// 인증 게시물 사진 업로드
router.post('/image/:certiId', upload.single('image'), certiController.postCertiImage);
// 인증 게시물 상세보기
router.get('/detail/:kakaoId', certiController.getCertiDetail);
// 해당 날짜의 인증 게시물 가져오기
router.get('/:kakaoId', certiController.getCertiByCal);
// 좋아요, 좋아요 취소
router.put('/like/:kakaoId', certiController.likeOrCancel);

module.exports = router;