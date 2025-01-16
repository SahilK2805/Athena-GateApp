const { newGate,ShareGate, getAllgates,getUsergates, gateStatus, getAdmingates,deleteGate, setLocation, setgeoLock, setLock, getLock} = require('../controller/gateController');
const router = require('express').Router();
const {authentication, restrictTo} = require('../controller/authController');

router.route('/')
    .post(authentication,restrictTo('0','1'), newGate)
    .get(authentication,restrictTo('0'), getAllgates);

router.route('/:id')
    .get(authentication,getUsergates)
    .delete(authentication,deleteGate)
    .post(authentication, gateStatus);

router.route('/share/:id')
    .post(authentication,restrictTo('0','1'),ShareGate);

router.route('/loc/:id')
    .post(authentication,restrictTo('0','1'),setLocation)

router.route('/geo/:id')    
    .post(authentication,setgeoLock);

router.route('/lock/:id')
    .post(authentication,setLock);

router.route('/admin/:id')
    .get(authentication,restrictTo('0','1'),getAdmingates);
module.exports = router;
