var express = require('express');
var router = express.Router();

router.use('/group', require('./group'));

module.exports = router;
