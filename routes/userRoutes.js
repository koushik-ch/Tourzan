const express=require('express');
const router=express.Router();
const userController=require('../controllers/userController');
const authController=require('../controllers/authController');



//Authentication
router.post('/signup',authController.signup); 
router.post('/login',authController.login);
router.get('/logout',authController.logout);

//Forgot password
router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)

router.use(authController.protect); //protect all routes after this middleware

//Current user
router.get('/me',userController.getMe,userController.getUser); 
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
router.delete('/deleteMe',userController.deleteMe);

router.use(authController.restrictTo('admin')) //Only the admin can access the routes below 

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports=router;
 