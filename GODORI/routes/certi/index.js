const express = require('express');
const router = express.Router();
const upload = require('../../modules/multer');
const certiController = require('../../controller/certiController');

// 인증 게시물 업로드
router.post('/:userName', upload.array('images'), certiController.postNewCerti);

module.exports = router;