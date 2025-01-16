const { signup, login, getUserdata, resetPassword, getUserbyId} = require('../controller/authController');


const router = require('express').Router();

router.route('/signup').post(signup);

router.route('/login').post(login);

router.route('/profile').post(getUserdata);
router.route('/profile/:id').get(getUserbyId);

router.route('/resetPassword').post(resetPassword);

module.exports = router;
