const express=require('express');
const viewsController=require('../controllers/viewsController.js');
const authController=require('../controllers/authController.js');
const bookingController=require('../controllers/bookingController.js');

const router=express.Router();

router.get('/me',authController.protect,viewsController.getAccount);
router.get('/my-tours',authController.protect,viewsController.getMyTours);

router.use(authController.isLoggedIn);

router.get('/',bookingController.createBookingCheckout,viewsController.getOverview);
router.get('/tour/:slug',viewsController.getTour);
router.get('/tour',viewsController.getTour);
router.get('/login',viewsController.getLoginForm);
router.get('/signup',viewsController.getSignupForm);
// router.post('')

module.exports=router;