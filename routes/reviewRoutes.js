const express=require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//By default each router has access to only its specified path, therefor we use 
//mergeParams to make the router access the entire previous route
const router=express.Router({mergeParams:true}); //So that we can access the tourId in the reviewRoutes

router.use(authController.protect); //protect all routes after this middleware

router.route('/')
    .get(authController.protect,reviewController.getAllReviews)
    .post(authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview);

router.route('/:id')
    .get(reviewController.getReview)   
    .patch(authController.restrictTo('user','admin'),reviewController.updateReview)
    .delete(authController.restrictTo('user','admin'),reviewController.deleteReview);

module.exports=router;
