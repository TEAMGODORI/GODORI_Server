const express = require('express');
const router = express.Router();
const upload = require('../../modules/multer');
const certiController = require('../../controller/certiController');

// 인증 게시물 업로드
router.post('/:userName', upload.array('images'), certiController.postNewCerti);
// 인증 게시물 상세보기
router.get('/detail/:certiId', certiController.getCertiDetail);

module.exports = router;