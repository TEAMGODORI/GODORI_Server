var express = require('express');
var router = express.Router();

router.use('/group', require('./group'));
router.use('/certi', require('./certi'));

module.exports = router;
