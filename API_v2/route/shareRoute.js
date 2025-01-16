const router = require('express').Router();
const { sharePage, tokenGen, controlGate } = require('../controller/shareController');

router.route('/').get(sharePage);
router.route('/:token').get(controlGate);
router.route('/token').post(tokenGen);

module.exports = router;