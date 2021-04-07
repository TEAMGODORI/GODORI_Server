var express = require('express');
var router = express.Router();

router.use('/group', require('./group'));
router.use('/certi', require('./certi'));
router.use('/mypage', require('./myPage'));

module.exports = router;
