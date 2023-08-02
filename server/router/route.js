const express = require('express');
const router = express.Router();

// import all controllers
const controller = require('../controllers/appControllers.js');
const registerMail = require('../controllers/mailer.js')
const middleware = require('../middleware/auth.js');


/** POST Methods */
router.route('/register').post(controller.register);
// router.route('/registerMail').post(registerMail); // send the email
router.route('/authenticate').post(controller.verifyUser,(req, res) => res.end());
router.route('/login').post(controller.verifyUser,controller.login);

/** GET Methods */
router.route('/user/:username').get(controller.getUser);
router.route('/generateOTP').get(controller.verifyUser,middleware.localVariables,controller.generateOTP);
router.route('/verifyOTP').get(controller.verifyUser,controller.verifyOTP);
router.route('/createResetSession').get(controller.createResetSession);

/** PUT Methods */
router.route('/updateuser').put(middleware.Auth,controller.updateUser);
router.route('/resetPassword').put(controller.verifyUser,controller.resetPassword);

module.exports = router;
